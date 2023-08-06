from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import mysql.connector

from Controller.db_connection import get_db_connection

api_vendas = Blueprint('api_vendas', __name__)

# API para buscar todas as vendas
@api_vendas.route('/vendas', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_todas_vendas():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM vendas')
        resultados = cursor.fetchall()
        cursor.close()
        conn.close()

        vendas = []
        for row in resultados:
            venda = {
                "id": row[0],
                "data_venda": row[1],
                "vendedor": row[2],
                "cliente": row[3],
                "cpf": row[4],
                "telefone": row[5],
                "forma_pagamento_id": row[6],
                "bandeira_id": row[7],
                "parcelamento": row[8],
                "subtotal": float(row[9]),
                "desconto": float(row[10]),
                "valor_total": float(row[11]),
                "valor_total_pago": float(row[12]),
                "valor_em_aberto": float(row[13]),
                "quantidade_itens": row[14],
                "lucro": float(row[15]),
                "numero_cupom_fiscal": row[16],
                "imposto_estadual": float(row[17]),
                "imposto_federal": float(row[18]),
                "cnpj": row[19],
                "cliente_id": row[20]
            }
            vendas.append(venda)

        return jsonify({
            "table": "vendas",
            "rows": vendas
        })

        return jsonify(vendas)

    except Exception as e:
        print("Erro ao buscar vendas:", str(e))
        return jsonify({'mensagem': 'Erro ao buscar vendas.'}), 500


# API para buscar uma venda específica
@api_vendas.route('/vendas/<int:venda_id>', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_venda(venda_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM vendas')
        resultados = cursor.fetchall()
        cursor.close()
        conn.close()

        vendas = []
        for row in resultados:
            venda = {
                "id": row[0],
                "data_venda": row[1],
                "vendedor": row[2],
                "cliente": row[3],
                "cpf": row[4],
                "telefone": row[5],
                "forma_pagamento_id": row[6],
                "bandeira_id": row[7],
                "parcelamento": row[8],
                "subtotal": float(row[9]),
                "desconto": float(row[10]),
                "valor_total": float(row[11]),
                "valor_total_pago": float(row[12]),
                "valor_em_aberto": float(row[13]),
                "quantidade_itens": row[14],
                "lucro": float(row[15]),
                "numero_cupom_fiscal": row[16],
                "imposto_estadual": float(row[17]),
                "imposto_federal": float(row[18]),
                "cnpj": row[19],
                "client_id": row[20]
            }
            vendas.append(venda)

        return jsonify({
            "table": "vendas",
            "rows": vendas
        })

        return jsonify(vendas)

    except Exception as e:
        print("Erro ao buscar vendas:", str(e))
        return jsonify({'mensagem': 'Erro ao buscar vendas.'}), 500


@api_vendas.route('/vendas/add', methods=['POST'])
@jwt_required()  # Protege a rota com JWT
def inserir_venda():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        dados = request.json
        data_venda = datetime.now()

        # Dados da venda
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

        # Itens vendidos
        itens_vendidos = dados['itens_vendidos']

        conn = get_db_connection()
        cursor = conn.cursor()

        # Inserir a venda na tabela vendas
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

        # Obter o ID da venda recém-inserida
        venda_id = cursor.lastrowid

        # Inserir os itens vendidos na tabela itens_venda
        sql_itens_vendas = '''
            INSERT INTO itens_vendas (venda_id, produto, codigo_produto, quantidade, preco_unitario, subtotal_item)
            VALUES (%s, %s, %s, %s, %s, %s)
        '''

        for item in itens_vendidos:
            produto = item['produto']
            codigo_produto = item['codigo_produto']
            quantidade = item['quantidade']
            preco_unitario = item['preco_unitario']
            subtotal_item = item['subtotal_item']
            val_item_vendido = (venda_id, produto, codigo_produto, quantidade, preco_unitario, subtotal_item)
            cursor.execute(sql_itens_vendas, val_item_vendido)

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'mensagem': 'Venda e itens vendidos inseridos com sucesso!'})

    except Exception as e:
        conn.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500



@api_vendas.route('/vendas/cfn', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_numero_cupom_vendas():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT max(id), numero_cupom_fiscal FROM vendas group by 2 order by 2 desc limit 1')
        resultados = cursor.fetchall()
        cursor.close()
        conn.close()

        vendas = []
        for row in resultados:
            venda = {
                "id": row[0],
                "numero_cupom_fiscal": row[1],
            }
            vendas.append(venda)

        return jsonify({
            "table": "vendas",
            "rows": vendas
        })

        return jsonify(vendas)

    except Exception as e:
        print("Erro ao buscar vendas:", str(e))
        return jsonify({'mensagem': 'Erro ao buscar vendas.'}), 500






# # API para atualizar dados de uma venda
# @api_vendas.route('/vendas/update/<int:venda_id>', methods=['PUT'])
# @jwt_required()  # Protege a rota com JWT
# def atualizar_venda(venda_id):
#     current_user = get_jwt_identity()
#     if not current_user:
#         return abort(404)
#
#     try:
#         dados = request.json
#         reconnect_db()
#         cursor = db.cursor()
#         sql = 'UPDATE vendas SET cliente_id = %s, forma_pagamento_id = %s, bandeira_id = %s, parcelamento = %s, ' \
#               'subtotal = %s, desconto = %s, total = %s WHERE venda_id = %s'
#
#         val = (
#             dados['cliente_id'], dados['forma_pagamento_id'], dados['bandeira_id'], dados['parcelamento'],
#             dados['subtotal'], dados['desconto'], dados['total'], venda_id
#         )
#         cursor.execute(sql, val)
#         db.commit()
#         cursor.close()
#         return jsonify({'mensagem': 'Venda atualizada com sucesso!'})
#
#     except Exception as e:
#         db.rollback()
#         print(str(e))
#         return jsonify({'erro': str(e)}), 500
#
#
# # API para excluir uma venda
# @api_vendas.route('/vendas/delete/<int:venda_id>', methods=['DELETE'])
# @jwt_required()  # Protege a rota com JWT
# def excluir_venda(venda_id):
#     current_user = get_jwt_identity()
#     if not current_user:
#         return abort(404)
#
#     try:
#         reconnect_db()
#         cursor = db.cursor()
#         sql = 'DELETE FROM vendas WHERE venda_id = %s'
#         val = (venda_id,)
#         cursor.execute(sql, val)
#         db.commit()
#         cursor.close()
#         return jsonify({'mensagem': 'Venda excluída com sucesso!'})
#
#     except Exception as e:
#         db.rollback()
#         print(str(e))
#         return jsonify({'erro': str(e)}), 500
