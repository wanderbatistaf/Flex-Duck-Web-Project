from flask import Blueprint, make_response
from flask_jwt_extended import jwt_required
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO
from flask import request

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
    total_com_desconto = cupom_fiscal_data.get('Total', 0) - desconto_reais
    # Obter o número de parcelas
    parcelas = cupom_fiscal_data.get('parcelamento', 1)
    # Calcular o valor de cada parcela
    valor_parcela = total_com_desconto / parcelas

    # Adicione a seção de Pagamentos
    elements.append(Paragraph(f'Parcelamento em {cupom_fiscal_data.get("parcelamento", 0)}x - {cupom_fiscal_data.get("bandeira", 0)}', body_style))
    elements.append(Paragraph(f'Parcela R$ {valor_parcela:.2f}', body_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f'Valor Pago R$ {cupom_fiscal_data.get("valorPago", 0):.2f}', body_style))
    elements.append(Paragraph(f'Troco R$ {cupom_fiscal_data.get("troco", 0):.2f}', body_style))

    elements.append(Paragraph(f'<b>TOTAL PAGO R$ {total_com_desconto:.2f}</b>', body_style))

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
    response.headers['Content-Disposition'] = 'inline; filename=cupom-fiscal.pdf'
    return response
