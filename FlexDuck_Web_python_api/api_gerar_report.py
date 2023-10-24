import datetime
import hashlib
import time
import mysql.connector

from flask import Blueprint, make_response, jsonify
from flask_jwt_extended import jwt_required
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO
from flask import request
from Controller.db_connection import get_db_connection


reports = Blueprint('reports', __name__)

# ...

@reports.route('/reports/cupom-fiscal', methods=['POST'])
@jwt_required()  # Protege a rota com JWT
def gerar_pdf():
    # Obtenha os dados enviados no corpo da solicitação (JSON)
    data = request.get_json()
    print(data)

    # Obtenha os dados do cupom fiscal do objeto JSON recebido
    cupom_fiscal_data = data.get('cupomFiscal', {})
    print(cupom_fiscal_data)

    # Crie um buffer de bytes para armazenar o PDF gerado
    buffer = BytesIO()

    # Crie um documento PDF usando o ReportLab
    doc = SimpleDocTemplate(buffer, pagesize=letter)

    # Crie uma lista para armazenar o conteúdo do PDF
    elements = []

    # Adicione o número da nota fiscal ao cabeçalho (canto direito)
    numero_nf = cupom_fiscal_data.get('numeroNF', '')
    numero_nf_style = ParagraphStyle(name='numero_nf', alignment=2, fontSize=12, textColor=colors.black)
    elements.append(Paragraph(f'CF {numero_nf}', numero_nf_style))

    # Carregar a imagem
    image_path = 'Reports/on_logo_hd.png'
    image = Image(image_path, width=130, height=160)

    # Adicionar a imagem à lista de elementos
    elements.append(image)

    # Adicione uma quebra de linha entre as tabelas de produtos e de pagamentos
    elements.append(Spacer(1, 12))  # Ajuste a altura da quebra de linha conforme necessário

    # Defina os estilos para os títulos e texto
    styles = getSampleStyleSheet()
    title_style = styles['Title']
    header_style = styles['Heading3']
    body_style = styles['Normal']

    # Adicione o cabeçalho do cupom fiscal ao PDF
    elements.append(Paragraph(f'CNPJ: 12.345.678/0001-01 | Tel: (27) 3244-6491', header_style))
    elements.append(Paragraph(f'Data e Hora: {cupom_fiscal_data.get("CfiscalDataHora", "")}', body_style))
    elements.append(Paragraph(f'Vendedor(a): {cupom_fiscal_data.get("vendorName", "")}', body_style))
    elements.append(Paragraph(f'Cliente: {cupom_fiscal_data.get("ClienteName", "")} | {cupom_fiscal_data.get("ClienteCPF_CNPJ", "")}', body_style))
    elements.append(Spacer(1, 12))

    # Crie uma tabela para os produtos
    table_data = []
    table_data.append(['Nome', 'Qtd', 'Preço', 'Desconto', 'Total'])
    for produto in cupom_fiscal_data.get('listaProdutos', []):
        table_data.append([
            produto.get('nome', ''),
            produto.get('qtd', ''),
            f'R$ {produto.get("preco", 0):.2f}',
            f'R$ {produto.get("desconto", 0):.2f}',
            f'R$ {produto.get("total", 0):.2f}',
        ])
    table_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ])
    table = Table(data=table_data, style=table_style)
    elements.append(table)
    elements.append(Spacer(1, 12))


    # Adicione a seção de Totais
    elements.append(Paragraph(f'Subtotal R$ {cupom_fiscal_data.get("SubTotal", 0):.2f}', body_style))
    elements.append(Paragraph(f'Desconto {cupom_fiscal_data.get("DescontoPercent", 0):.2f}%', body_style))
    elements.append(Paragraph(f'Total R$ {cupom_fiscal_data.get("Total", 0):.2f}', body_style))
    elements.append(Spacer(1, 12))

    # Calcular o valor do desconto em reais
    desconto_reais = cupom_fiscal_data.get('DescontoValor', 0)
    # Calcular o total a pagar após o desconto
    total_ = cupom_fiscal_data.get('Total', 0)
    # Obter o número de parcelas
    parcelas = cupom_fiscal_data.get('parcelamento', 1)
    # Calcular o valor de cada parcela
    valor_parcela = cupom_fiscal_data.get('Total', 0) / parcelas

    # Adicione a seção de Pagamentos
    elements.append(Paragraph(f'Parcelamento em {cupom_fiscal_data.get("parcelamento", 0)}x - {cupom_fiscal_data.get("bandeira", 0)}', body_style))
    elements.append(Paragraph(f'Parcela R$ {valor_parcela:.2f}', body_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f'Valor Pago R$ {cupom_fiscal_data.get("valorPago", 0):.2f}', body_style))
    elements.append(Paragraph(f'Troco R$ {cupom_fiscal_data.get("troco", 0):.2f}', body_style))

    elements.append(Paragraph(f'<b>TOTAL PAGO R$ {total_:.2f}</b>', body_style))

    # Adicione a nota de rodapé centralizada
    nota_rodape_style = ParagraphStyle('NotaRodapeStyle', parent=body_style, alignment=1)
    nota_rodape = '<i>*Esse ticket não é um documento fiscal.*</i>'
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(nota_rodape, nota_rodape_style))

    # Feche o documento PDF
    doc.build(elements)

    # Obtenha os bytes do buffer e crie uma resposta para o cliente
    pdf_bytes = buffer.getvalue()
    response = make_response(pdf_bytes)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'inline; filename=FlexDuckCF{numero_nf}.pdf'
    return response

@reports.route('/reports/os-print', methods=['POST'])
def gerar_os_pdf():
    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)

    # Número máximo de tentativas
    max_attempts = 3
    current_attempt = 0

    while current_attempt < max_attempts:
        try:
            cursor = db.cursor()
            cursor.execute('SELECT * FROM company_settings')
            resultados = cursor.fetchall()
            cursor.close()
            break  # Sai do loop se a consulta foi bem-sucedida
        except mysql.connector.errors.OperationalError:
            current_attempt += 1
            if current_attempt == max_attempts:
                print(
                    "Erro de conexão com o banco de dados após várias tentativas. Verifique a conexão e tente novamente mais tarde.")
                return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500
            else:
                time.sleep(2)  # Pausa de 2 segundos antes de tentar novamente

    # Obtenha os dados da Ordem de Serviço a partir do JSON recebido
    os_data = request.json

    # Crie um buffer de bytes para armazenar o PDF gerado
    buffer = BytesIO()

    # Crie um documento PDF usando o ReportLab
    doc = SimpleDocTemplate(buffer, pagesize=letter, title=f"os_report_{os_data['numeroOrdem']}")

    # Crie uma lista para armazenar os elementos do PDF
    elements = []

    # Estilo alinhado à esquerda para os cabeçalhos
    header_style = ParagraphStyle(name='header', alignment=0, fontSize=14, textColor=colors.black, spaceBefore=3)

    # Estilo alinhado à esquerda para o título
    title_style = ParagraphStyle(name='title', alignment=0, fontSize=16, textColor=colors.black, spaceAfter=12)

    # Estilo alinhado à esquerda para o título
    title_style_names = ParagraphStyle(name='title', alignment=0, fontSize=16, textColor=colors.black, spaceAfter=5)

    # Estilo alinhado à direita para o valor
    value_style = ParagraphStyle(name='value', alignment=2, fontSize=14, textColor=colors.black, spaceBefore=12)

    # Estilo alinhado à esquerda para o assinatura
    line_style = ParagraphStyle(name='line', alignment=0, fontSize=14, textColor=colors.black, spaceBefore=12)
    # Estilo alinhado à esquerda para o texto assinatura
    line_style_txt = ParagraphStyle(name='line', alignment=0, fontSize=14, textColor=colors.black, spaceBefore=12,
                                    leftIndent=90,  # Recuo à esquerda (ajuste conforme necessário)
                                    rightIndent=20,  # Recuo à direita (ajuste conforme necessário)
                                    )

    # Adicione o número da nota fiscal ao cabeçalho (canto direito)
    os_number = os_data.get('numeroOrdem', '')
    os_paragraph_style = ParagraphStyle(name='os_number', alignment=2, fontSize=12, textColor=colors.black)
    elements.append(Paragraph(f'Ordem de Serviço: {os_number}', os_paragraph_style))

    # Obtém a data e hora atual
    now = datetime.datetime.now()
    # Formata a data e hora no formato desejado (yyyy-MM-dd hh-MM-ss)
    formatted_datetime = now.strftime('%Y-%m-%d %H:%M:%S')

    elements.append(Paragraph(f'{formatted_datetime}', os_paragraph_style))

    # Adicione uma tabela para as informações da empresa
    empresa_info = resultados[0]  # A primeira linha dos resultados contém as informações da empresa

    # Empresa
    elements.append(Paragraph(f'<b>{empresa_info[2]}</b>', title_style_names))
    elements.append(Paragraph(f'CNPJ: {empresa_info[3]}  |  Telefone: {empresa_info[6]}', header_style))
    elements.append(Paragraph(f'{empresa_info[8]}, {empresa_info[9]} - {empresa_info[7]}, {empresa_info[11]}', header_style))
    # Adicione um espaço em branco
    elements.append(Spacer(1, 16))

    # Adicione informações do cliente com quebras de linha
    elements.append(Paragraph(f'{os_data["cliente"]}', title_style_names))
    elements.append(Paragraph(f'CPF: {os_data["cpf"]}', header_style))
    elements.append(Paragraph(f'Telefone: {os_data["telefone"]}', header_style))
    # Adicione um espaço em branco
    elements.append(Spacer(1, 16))

    # Crie uma tabela para as informações do aparelho
    aparelho_data = [
        ['Modelo', 'IMEI', 'Estado do Aparelho'],
        [os_data["modelo"], os_data["imei"], os_data["estadoAparelho"]]
    ]

    aparelho_table_style = TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER')
    ])

    aparelho_table = Table(aparelho_data, style=aparelho_table_style, colWidths=[100, 100, 200])
    elements.append(aparelho_table)

    # Adicione uma quebra de linha
    elements.append(Spacer(1, 12))

    # Adicione informações de chip, cartão de memória e película em uma tabela
    table_data = [['Chip', 'Cartão de Memória', 'Película'],
                  [os_data["chip"], os_data["cartaoMemoria"], os_data["pelicula"]]]
    table_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER')
    ])
    table = Table(data=table_data, style=table_style)
    elements.append(table)

    # Adicione uma quebra de linha
    elements.append(Spacer(1, 12))

    # Adicione as informações de "Defeito Relatado" e "Serviço a ser Realizado" em uma tabela com quebras de linha
    defeito_servico_table_data = [['Defeito Relatado', 'Serviço a ser Realizado'],
                                  [os_data["defeitoRelatado"], os_data["servicoARealizar"]]]
    defeito_servico_table_style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.orange),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT')
    ])
    defeito_servico_table = Table(defeito_servico_table_data, style=defeito_servico_table_style, colWidths=[225, 225])
    elements.append(defeito_servico_table)

    # Adicione uma quebra de linha
    elements.append(Spacer(1, 12))

    # Adicione a tabela de produtos, valores e descontos
    produtos_data = [["Produto", "Valor", "Desconto", "Quantidade", "Total"]]
    for item in os_data["itens"]:
        if "produto" in item:
            produto = item["produto"]
        else:
            produto = item["nomeProduto"]
        if "preco" in item:
            valor = item["preco"]
        else:
            valor = item["precoUnitario"]
        desconto = item["desconto"]
        quantidade = item["quantidade"]
        if "total" in item:
            total = item["total"]
        else:
            total = item["subtotal"]

        # Adicione cada linha à tabela
        produtos_data.append([produto, f'R$ {valor}', f'R$ {desconto}', quantidade, total])

    produtos_table_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER')
    ])

    produtos_table = Table(produtos_data, style=produtos_table_style)
    elements.append(produtos_table)
    # Adicione uma quebra de linha
    elements.append(Spacer(1, 48))

    signature_line = "______________________________"
    elements.append(Paragraph(signature_line, line_style))
    elements.append((Paragraph('Cliente', line_style_txt)))

    # Adicione o valor à direita
    elements.append(Paragraph(f'<b>Valor: R$ {os_data["valorInicial"]}</b>', value_style))

    # Adicione uma quebra de linha
    elements.append(Spacer(1, 12))

    # Combine as informações em uma única string
    informacoes_combinadas = f'{empresa_info[2]}{empresa_info[3]}{formatted_datetime}{os_data["cliente"]}{os_data["telefone"]}{os_data["cpf"]}'

    # Crie um hash MD5 das informações combinadas
    codigo_unico = hashlib.md5(informacoes_combinadas.encode()).hexdigest()

    # Adicione o código único no rodapé da página
    footer_code = codigo_unico
    footer_style = ParagraphStyle(name='footer', alignment=2, fontSize=10, textColor=colors.black)
    elements.append(Paragraph(f'Código Único: {footer_code}', footer_style))

    # Feche o documento PDF
    doc.build(elements)

    # Obtenha os bytes do buffer e crie uma resposta para o cliente
    pdf_bytes = buffer.getvalue()
    response = make_response(pdf_bytes)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'inline; filename=os_report_{os_number}.pdf'
    response.headers['Content-Title'] = f'os_report_{os_number}'

    return response






