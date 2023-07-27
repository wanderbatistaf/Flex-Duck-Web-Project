from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import mysql.connector

from Controller.mysql_connector import get_db_connection

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


# API para inserir uma nova venda
@api_vendas.route('/vendas/add', methods=['POST'])
@jwt_required()  # Protege a rota com JWT
def inserir_venda():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        dados = request.json
        dados['data_venda'] = datetime.now()
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = '''
            INSERT INTO vendas (
                cliente_id, data_venda, vendedor, cliente, cpf, telefone, forma_pagamento_id,
                bandeira_id, parcelamento, subtotal, desconto, valor_total,
                valor_total_pago, valor_em_aberto, quantidade_itens, lucro,
                numero_cupom_fiscal, imposto_estadual, imposto_federal, cnpj
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        '''
        val = (
            dados['cliente_id'], dados['data_venda'], dados['vendedor'], dados['cliente'], dados['cpf'],
            dados['telefone'], dados['forma_pagamento_id'], dados['bandeira_id'],
            dados['parcelamento'], dados['subtotal'], dados['desconto'], dados['valor_total'],
            dados['valor_total_pago'], dados['valor_em_aberto'], dados['quantidade_itens'],
            dados['lucro'], dados['numero_cupom_fiscal'], dados['imposto_estadual'],
            dados['imposto_federal'], dados['cnpj']
        )
        cursor.execute(sql, val)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'mensagem': 'Venda inserida com sucesso!'})

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
