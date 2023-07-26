
from flask import Blueprint, jsonify, request, abort, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity

from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Spacer, Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, TableStyle
from io import BytesIO
from flask import request, make_response

from Controller.mysql_connector import get_db_connection
from Controller.mysql_connector import reconnect_db

reports = Blueprint('reports', __name__)


# Configura a conexão com o banco de dados MySQL
db = get_db_connection()

# Função para reconectar ao banco de dados
def reconnect_db():
    db.ping(reconnect=True)


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

    # Carregar a imagem
    image_path = 'Reports/on_logo_hd.png'
    image = Image(image_path, width=130, height=160)

    # Adicionar a imagem à lista de elementos
    elements.append(image)

    # Adicione uma quebra de linha entre as tabelas de produtos e de pagamentos
    elements.append(Spacer(1, 12))  # Ajuste a altura da quebra de linha conforme necessário

    # Adicione o cabeçalho do cupom fiscal ao PDF
    cupom_fiscal_header = [
        ['--- FlexDuck ---'],
        ['CNPJ: 12.345.678/0001-01 | Tel: (27) 3244-6491'],
        [cupom_fiscal_data.get('CfiscalDataHora', '')],
        [f"Vendedor(a): {cupom_fiscal_data.get('vendorName', '')}"],
        [f"{cupom_fiscal_data.get('ClienteName', '')} | {cupom_fiscal_data.get('ClienteCPF_CNPJ', '')}"],
        ['Cupom Fiscal'],
    ]
    table = Table(data=cupom_fiscal_header)
    table_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ])
    table.setStyle(table_style)
    elements.append(table)

    # Adicione uma quebra de linha entre as tabelas de produtos e de pagamentos
    elements.append(Spacer(1, 12))  # Ajuste a altura da quebra de linha conforme necessário

    # Adicione os produtos ao PDF
    table_data = []
    table_data.append(['Nome', 'Qtd', 'Preço', 'Desconto', 'Total'])
    for produto in cupom_fiscal_data.get('listaProdutos', []):
        table_data.append([
            produto.get('nome', ''),
            produto.get('qtd', ''),
            produto.get('preco', ''),
            produto.get('desconto', ''),
            produto.get('total', ''),
        ])
    table = Table(data=table_data)
    table_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ])
    table.setStyle(table_style)
    elements.append(table)

    # Adicione uma quebra de linha entre as tabelas de produtos e de pagamentos
    elements.append(Spacer(1, 12))  # Ajuste a altura da quebra de linha conforme necessário

    # Adicione a tabela de totais
    total_data = [
        ['--- TOTAIS ---'],
        ['Subtotal', '', f'R$ {cupom_fiscal_data.get("SubTotal", 0):.2f}'],
        ['Desconto', '', f'{cupom_fiscal_data.get("DescontoPercent", 0):.2f}%'],
        ['Total', '', f'R$ {cupom_fiscal_data.get("Total", 0):.2f}'],
    ]
    total_style = TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.Color(248 / 255, 204 / 255, 126 / 255)),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('SPAN', (0, 0), (0, 0)),  # Mescla a célula (0, 0) com a célula (0, 2)
    ])
    total_table = Table(data=total_data)
    total_table.setStyle(total_style)
    elements.append(Paragraph('<br/>', style=None))
    elements.append(total_table)

    # Adicione a seção de Pagamentos
    pagamento_data = [
        ['PARCELAMENTO', f'{cupom_fiscal_data.get("parcelamento", 0)}x'],
        ['TOTAL PAGO', f'R${cupom_fiscal_data.get("Total", 0):.2f} x{cupom_fiscal_data.get("parcelamento", 0)}'],
    ]
    pagamento_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
    ])
    pagamento_table = Table(data=pagamento_data)
    pagamento_table.setStyle(pagamento_style)
    elements.append(Paragraph('<br/>', style=None))
    elements.append(pagamento_table)

    # Adicione a nota de rodapé
    nota_rodape = '<i>*Esse ticket não é um documento fiscal.*</i>'
    elements.append(Paragraph(nota_rodape, style=None))

    # Feche o documento PDF
    doc.build(elements)

    # Obtenha os bytes do buffer e crie uma resposta para o cliente
    pdf_bytes = buffer.getvalue()
    response = make_response(pdf_bytes)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'inline; filename=cupom-fiscal.pdf'
    print(response)
    return response