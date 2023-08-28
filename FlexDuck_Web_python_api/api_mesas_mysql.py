from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import mysql.connector

from Controller.db_connection import get_db_connection

api_mesas = Blueprint('api_mesas', __name__)

# API para buscar todas as vendas
@api_vendas.route('/vendas/add', methods=['POST'])
@jwt_required()  # Protege a rota com JWT
def inserir_venda():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    subdomain = request.headers.get('X-Subdomain')

    conn = get_db_connection(subdomain)

    try:
        dados = request.json
        data_venda = datetime.now()

        cliente_id = dados['cliente_id']
        vendedor = dados['vendedor']
        cliente = dados['cliente']
        cpf_cnpj = dados['cpf_cnpj']
        telefone = dados['telefone']
        forma_pagamento_id = dados['forma_pagamento_id']
        bandeira_id = dados['bandeira_id']
        parcelamento = dados['parcelamento']
        subtotal = dados['subtotal']
        desconto = dados['desconto']
        valor_total = dados['valor_total']
        valor_total_pago = dados['valor_total_pago']
        troco = dados['troco']
        quantidade_itens = dados['quantidade_itens']
        numero_cupom_fiscal = dados['numero_cupom_fiscal']
        imposto_estadual = dados['imposto_estadual']
        imposto_federal = dados['imposto_federal']
        mesa_id = dados['mesa_id']  # Novo campo para mesa

        itens_vendidos = dados['itens_vendidos']

        conn = conn
        cursor = conn.cursor()

        sql_venda = '''
            INSERT INTO vendas (
                cliente_id, data_venda, vendedor, cliente, cpf_cnpj, telefone, forma_pagamento_id,
                bandeira_id, parcelamento, subtotal, desconto, valor_total,
                valor_total_pago, troco, quantidade_itens,
                numero_cupom_fiscal, imposto_estadual, imposto_federal
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        '''

        val_venda = (
            cliente_id, data_venda, vendedor, cliente, cpf_cnpj,
            telefone, forma_pagamento_id, bandeira_id,
            parcelamento, subtotal, desconto, valor_total,
            valor_total_pago, troco, quantidade_itens,
            numero_cupom_fiscal, imposto_estadual,
            imposto_federal
        )

        cursor.execute(sql_venda, val_venda)

        venda_id = cursor.lastrowid

        sql_itens_vendas = '''
            INSERT INTO itens_vendas (venda_id, produto, codigo_produto, quantidade, preco_unitario, subtotal_item)
            VALUES (%s, %s, %s, %s, %s, %s)
        '''

        sql_mesas_consumidos = '''
            INSERT INTO mesas_consumidos (mesa_id, codigo_produto, nome_produto, quantidade, preco)
            VALUES (%s, %s, %s, %s, %s)
        '''

        for item in itens_vendidos:
            produto = item['produto']
            codigo_produto = item['codigo_produto']
            quantidade = item['quantidade']
            preco_unitario = item['preco_unitario']
            subtotal_item = item['subtotal_item']

            val_item_vendido = (venda_id, produto, codigo_produto, quantidade, preco_unitario, subtotal_item)
            cursor.execute(sql_itens_vendas, val_item_vendido)

            # Inserir os produtos consumidos na tabela mesas_consumidos
            nome_produto = item['nome_produto']
            preco = item['preco']
            val_mesas_consumidos = (mesa_id, codigo_produto, nome_produto, quantidade, preco)
            cursor.execute(sql_mesas_consumidos, val_mesas_consumidos)

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'mensagem': 'Venda e itens vendidos inseridos com sucesso!'})

    except Exception as e:
        conn.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500
