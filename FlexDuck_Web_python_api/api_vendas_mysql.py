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

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    conn = get_db_connection(subdomain)

    try:
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
                "cpf_cnpj": row[4],
                "telefone": row[5],
                "forma_pagamento_id": row[6],
                "bandeira_id": row[7],
                "parcelamento": row[8],
                "subtotal": float(row[9]),
                "desconto": float(row[10]),
                "valor_total": float(row[11]),
                "valor_total_pago": float(row[12]),
                "troco": float(row[13]),
                "quantidade_itens": row[14],
                "numero_cupom_fiscal": row[15],
                "imposto_estadual": float(row[16]),
                "imposto_federal": float(row[17]),
                "cliente_id": row[18],
                "origem": row[19]
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

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    conn = get_db_connection(subdomain)

    try:
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
                "cpf_cnpj": row[4],
                "telefone": row[5],
                "forma_pagamento_id": row[6],
                "bandeira_id": row[7],
                "parcelamento": row[8],
                "subtotal": float(row[9]),
                "desconto": float(row[10]),
                "valor_total": float(row[11]),
                "valor_total_pago": float(row[12]),
                "troco": float(row[13]),
                "quantidade_itens": row[14],
                "numero_cupom_fiscal": row[15],
                "imposto_estadual": float(row[16]),
                "imposto_federal": float(row[17]),
                "cliente_id": row[18],
                "origem": row[19]
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
def inserir_venda_varejo():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    conn = get_db_connection(subdomain)

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
        origem = 'Varejo'

        # Itens vendidos
        itens_vendidos = dados['itens_vendidos']

        conn = conn
        cursor = conn.cursor()

        # Inserir a venda na tabela vendas
        sql_venda = '''
            INSERT INTO vendas (
                cliente_id, data_venda, vendedor, cliente, cpf_cnpj, telefone, forma_pagamento_id,
                bandeira_id, parcelamento, subtotal, desconto, valor_total,
                valor_total_pago, troco, quantidade_itens,
                numero_cupom_fiscal, imposto_estadual, imposto_federal, origem
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        '''
        val_venda = (
            cliente_id, data_venda, vendedor, cliente, cpf_cnpj,
            telefone, forma_pagamento_id, bandeira_id,
            parcelamento, subtotal, desconto, valor_total,
            valor_total_pago, troco, quantidade_itens,
            numero_cupom_fiscal, imposto_estadual,
            imposto_federal, origem
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

        # Atualizar a quantidade de produtos vendidos no estoque em produtos_servicos
        for item in itens_vendidos:
            codigo_produto = item['codigo_produto']
            quantidade_vendida = item['quantidade']

            # Consulta para atualizar a quantidade no estoque
            sql_atualizar_estoque = '''
            UPDATE produtos_servicos
            SET quantidade = quantidade - %s
            WHERE codigo = %s
            '''
            val_atualizar_estoque = (quantidade_vendida, codigo_produto)
            cursor.execute(sql_atualizar_estoque, val_atualizar_estoque)

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

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    conn = get_db_connection(subdomain)

    try:
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


# Rota para buscar todas as vendas realizadas via modulo de mesas
@api_vendas.route('/vendas/mesas', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_vendas_mesas():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    conn = get_db_connection(subdomain)

    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM vendas WHERE origem = "mesas"')
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
                "cpf_cnpj": row[4],
                "telefone": row[5],
                "forma_pagamento_id": row[6],
                "bandeira_id": row[7],
                "parcelamento": row[8],
                "subtotal": float(row[9]),
                "desconto": float(row[10]),
                "valor_total": float(row[11]),
                "valor_total_pago": float(row[12]),
                "troco": float(row[13]),
                "quantidade_itens": row[14],
                "numero_cupom_fiscal": row[15],
                "imposto_estadual": float(row[16]),
                "imposto_federal": float(row[17]),
                "cliente_id": row[18],
                "origem": row[19]
            }
            vendas.append(venda)

        return jsonify({
            "table": "vendas",
            "rows": vendas
        })

    except Exception as e:
        print("Erro ao buscar vendas:", str(e))
        return jsonify({'mensagem': 'Erro ao buscar vendas.'}), 500



# Rota para inserir as vendas realizadas via módulo de mesas
@api_vendas.route('/vendas/mesas/add', methods=['POST'])
@jwt_required()  # Protege a rota com JWT
def inserir_venda_mesas():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    conn = get_db_connection(subdomain)

    try:
        dados = request.json
        data_venda = datetime.now()
        print(dados)

        # Dados da venda
        numero_mesa = dados['numero_mesa']
        nome_mesa = dados['nome_mesa']
        telefone_responsavel = dados['telefone_responsavel']
        abertura = data_venda
        tempo_aberta = datetime.strptime(dados['tempo_aberta'], '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%Y-%m-%d %H:%M:%S')
        iniciado = dados['iniciado']
        tempo_inicial = dados['tempo_inicial']
        tempo_total = dados['tempoTotal']
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

        conn = conn
        cursor = conn.cursor()

        # Inserir a venda na tabela mesas
        sql_venda = '''
            INSERT INTO mesas (
                numero, nome, telefoneResponsavel, abertura, tempoAberta, iniciado, tempoInicial, tempoTotal,
                forma_pagamento_id, bandeira_id, parcelamento, subtotal, desconto, valor_total,
                valor_total_pago, troco, quantidade_itens,
                numero_cupom_fiscal, imposto_estadual, imposto_federal
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        '''
        val_venda = (
            numero_mesa, nome_mesa, telefone_responsavel, abertura, tempo_aberta, iniciado, tempo_inicial, tempo_total,
            forma_pagamento_id, bandeira_id, parcelamento, subtotal, desconto, valor_total,
            valor_total_pago, troco, quantidade_itens,
            numero_cupom_fiscal, imposto_estadual, imposto_federal
        )
        cursor.execute(sql_venda, val_venda)

        # Obter o ID da venda recém-inserida
        mesa_id = cursor.lastrowid

        # Inserir os itens vendidos na tabela mesas_consumidos
        sql_itens_vendas = '''
            INSERT INTO mesas_consumidos (mesa_id, codigo_produto, nome_produto, quantidade, preco)
            VALUES (%s, %s, %s, %s, %s)
        '''

        for item in itens_vendidos:
            codigo_produto = item['codigo_produto']
            produto = item['produto']
            quantidade = item['quantidade']
            preco_unitario = item['preco_unitario']
            val_item_vendido = (mesa_id, codigo_produto, produto, quantidade, preco_unitario)
            cursor.execute(sql_itens_vendas, val_item_vendido)

            # Atualizar a quantidade de produtos vendidos no estoque em produtos_servicos
            # Esta é a nova parte que atualiza a quantidade de itens vendidos
            sql_atualizar_estoque = '''
            UPDATE produtos_servicos
            SET quantidade = quantidade - %s
            WHERE codigo = %s
            '''
            val_atualizar_estoque = (quantidade, codigo_produto)
            cursor.execute(sql_atualizar_estoque, val_atualizar_estoque)

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'mensagem': 'Venda e itens vendidos inseridos com sucesso!'})

    except Exception as e:
        conn.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500


# Rota para buscar todas as vendas incluindo mesas (reports)
@api_vendas.route('/vendas/reports', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_todas_vendas_reports():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    conn = get_db_connection(subdomain)

    try:
        cursor = conn.cursor()
        cursor.execute('''
            WITH xablau AS (WITH vendas_t AS (SELECT 
    *
FROM vendas AS A
LEFT JOIN (select venda_id, produto, preco_unitario, quantidade, subtotal_item, codigo_produto from itens_vendas) AS B ON A.id = B.venda_id),

mesas_t AS (
SELECT 
    *
FROM mesas AS A
LEFT JOIN (SELECT mesa_id, codigo_produto, nome_produto, quantidade, preco from mesas_consumidos) AS B ON A.id = B.mesa_id)

SELECT DISTINCT id,
data_venda,
cliente,
vendedor,
forma_pagamento_id,
bandeira_id,
parcelamento,
ROUND(subtotal,2) AS subtotal,
ROUND(desconto,2) AS desconto,
ROUND(valor_total,2) AS valor_total, 
ROUND(valor_total_pago,2) AS valor_total_pago,
ROUND(troco,2) AS troco,
quantidade_itens,
codigo_produto,
ROUND(preco_unitario,2) AS preco_unitario,
quantidade FROM vendas_t

UNION

SELECT DISTINCT CONCAT('M-', id) AS id,
abertura,
nome,
'Mesa',
forma_pagamento_id,
bandeira_id,
parcelamento,
ROUND(subtotal,2) AS subtotal,
ROUND(desconto,2) AS desconto,
ROUND(valor_total,2) AS valor_total,
ROUND(valor_total_pago,2) AS valor_total_pago,
ROUND(troco,2) AS troco,
quantidade_itens,
codigo_produto,
ROUND(preco,2) AS preco,
quantidade FROM mesas_t )

SELECT A.*, B.nome, B.preco_custo, B.estoque FROM xablau AS A LEFT JOIN (select nome, codigo, preco_custo, quantidade AS estoque from produtos_servicos) AS B ON A.codigo_produto = B.codigo
        ''')
        resultados = cursor.fetchall()
        cursor.close()
        conn.close()

        vendas_agrupadas = {}

        for row in resultados:
            venda_id = row[0]

            if venda_id not in vendas_agrupadas:
                vendas_agrupadas[venda_id] = {
                    "id": venda_id,
                    "data_venda": row[1],
                    "cliente": row[2],
                    "vendedor": row[3],
                    "forma_pagamento_id": row[4],
                    "bandeira_id": row[5],
                    "parcelamento": row[6],
                    "subtotal": float(row[7]),
                    "desconto": float(row[8]),
                    "valor_total": float(row[9]),
                    "valor_total_pago": float(row[10]),
                    "troco": float(row[11]),
                    "quantidade_itens": row[12],
                    "produtos": []  # Inicializa um array para os produtos desta venda
                }

            # Verifica se há informações de produtos válidas na linha
            if row[13] and row[14] and row[15] and row[16] and row[17] and row[18]:
                produto = {
                    "codigo_produto": row[13],
                    "produto": row[16],
                    "preco_custo": float(row[17]),
                    "preco_unitario": float(row[14]),
                    "quantidade": row[15],
                    "estoque": row[18]
                }
                vendas_agrupadas[venda_id]["produtos"].append(produto)

        # Converta o dicionário em uma lista de vendas agrupadas
        vendas = list(vendas_agrupadas.values())

        return jsonify({
            "table": "vendas",
            "rows": vendas
        })

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
