import json
import time
from datetime import datetime

import mysql.connector

from flask import Blueprint
from flask import Flask, jsonify, request, abort, Response
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from Controller.db_connection import get_db_connection

api_servicos = Blueprint('api_servicos', __name__)


# API SERVICOS #
# Define a rota GET para buscar dados do banco de dados
@api_servicos.route('/servicos', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

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
            cursor.execute('SELECT * FROM servicos LEFT JOIN itens_servicos USING(numeroOrdem)')
            resultados = cursor.fetchall()
            cursor.close()
            break  # Sai do loop se a consulta foi bem-sucedida
        except mysql.connector.errors.OperationalError:
            current_attempt += 1
            if current_attempt == max_attempts:
                print("Erro de conexão com o banco de dados após várias tentativas. Verifique a conexão e tente novamente mais tarde.")
                return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500
            else:
                time.sleep(2)  # Pausa de 2 segundos antes de tentar novamente

    items = []
    current_service = None

    for row in resultados:
        if current_service is None or current_service['numeroOrdem'] != row[0]:
            # Um novo serviço é encontrado
            if current_service is not None:
                items.append(current_service)
            current_service = {
                'numeroOrdem': row[0],
                'servico': row[1],
                'responsavel': row[2],
                'cliente': row[3],
                'telefone': row[4],
                'cpf': row[5],
                'modelo': row[6],
                'imei': row[7],
                'estadoAparelho': row[8],
                'chip': row[9],
                'cartaoMemoria': row[10],
                'pelicula': row[11],
                'defeitoRelatado': row[12],
                'servicoARealizar': row[13],
                'status': row[14],
                'status_pgt': row[15],
                'valorInicial': row[16],
                'itens': []
            }
        item = {
            'codigoProduto': row[27],
            'nomeProduto': row[28],
            'precoUnitario': float(row[29]),
            'quantidade': float(row[30]),
            'desconto': float(row[31]),
            'subtotal': float(row[32])
        }
        current_service['itens'].append(item)

    # Adicione o último serviço à lista de itens
    if current_service is not None:
        items.append(current_service)

    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)

# Define a rota POST para inserir dados no banco de dados
@api_servicos.route('/servicos/add', methods=['POST'])
@jwt_required()
def inserir_dados():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    dados = request.json
    itens = dados['itens']
    print(dados['itens'])
    cursor = db.cursor()

    # Deduza os itens do estoque
    for item in itens:
        codigo = item['codigo']
        produto = item['produto']
        quantidade = item['quantidade']

        # Verifique se é "Mão de Obra" (ou outro critério para produtos/serviços que não precisam ser deduzidos)
        if produto != 'Mão de Obra':
            # Consulte o estoque atual do produto a partir do banco de dados
            sql_estoque = 'SELECT quantidade FROM produtos_servicos WHERE codigo = %s'
            cursor.execute(sql_estoque, (codigo,))
            estoque_atual = cursor.fetchone()

            if estoque_atual:
                estoque_atual = estoque_atual[0]
                novo_estoque = estoque_atual - quantidade

                # Atualize o estoque no banco de dados
                sql_atualizar_estoque = 'UPDATE produtos_servicos SET quantidade = %s WHERE codigo = %s'
                cursor.execute(sql_atualizar_estoque, (novo_estoque, codigo))

        # Agora, prossiga com a inserção dos dados do serviço e dos itens relacionados
        sql_servico = 'INSERT INTO servicos (numeroOrdem, servico, responsavel, cliente, telefone, cpf, modelo, imei, estadoAparelho, chip, cartaoMemoria, pelicula, defeitoRelatado, servicoARealizar, status, status_pgt, valorInicial, forma_pagamento_id, bandeira_id, parcelamento, subtotal, desconto, valor_total, valor_total_pago, troco) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
        val_servico = (
            dados['numeroOrdem'],
            dados['servico'],
            dados['responsavel'],
            dados['cliente'],
            dados['telefone'],
            dados['cpf'],
            dados['modelo'],
            dados['imei'],
            dados['estadoAparelho'],
            dados['chip'],
            dados['cartaoMemoria'],
            dados['pelicula'],
            dados['defeitoRelatado'],
            dados['servicoARealizar'],
            dados['status'],
            dados['status_pgt'],
            dados['valorInicial'],
            None,  # forma_pagamento_id
            None,  # bandeira_id
            None,  # parcelamento
            None,  # subtotal
            None,  # desconto
            None,  # valor_total
            None,  # valor_total_pago
            None,  # troco
        )
        cursor.execute(sql_servico, val_servico)

    # Obtém o ID do serviço inserido
    numeroOrdem = dados['numeroOrdem']

    # Insere os itens relacionados ao serviço
    for item in itens:
        codigo = item['codigo']
        produto = item['produto']
        preco = item['preco']
        desconto = item['desconto']
        quantidade = item['quantidade']
        total = item['total']

        sql_item = 'INSERT INTO itens_servicos (numeroOrdem, codigoProduto, nomeProduto, precoUnitario, desconto, quantidade, subtotal) VALUES (%s, %s, %s, %s, %s, %s, %s)'
        val_item = (numeroOrdem, codigo, produto, preco, desconto, quantidade, total)
        cursor.execute(sql_item, val_item)

    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados inseridos com sucesso!'})


# Define a rota PUT para atualizar dados no banco de dados
@api_servicos.route('/servicos/update/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_dados(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    dados = request.json
    print(dados)
    cursor = db.cursor()
    sql = ('UPDATE servicos (numeroOrdem, servico, responsavel, cliente,telefone,cpf, modelo, imei, estadoAparelho, chip, '
           'cartaoMemoria, pelicula, defeitoRelatado, servicoARealizar, status, valorInicial ) '
           'VALUES (%s, %s, %s, %s,%s, %s, %s, %s,%s, %s, %s, %s,%s, %s, %s, %s)')
    val = (
    dados['numeroOrdem'], dados['servico'], dados['responsavel'], dados['cliente'], dados['telefone'], dados['cpf'],
    dados['modelo'], dados['imei'], dados['estadoAparelho'], dados['chip'], dados['cartaoMemoria'], dados['pelicula'],
    dados['defeitoRelatado'], dados['servicoARealizar'], dados['status'], dados['valorInicial'])
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})


@api_servicos.route('/servicos/lastOsCode', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados_lastOsCode():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()
    sql = 'SELECT max(numeroOrdem) as numeroOrdem from servicos LIMIT 1'
    cursor.execute(sql)
    result = cursor.fetchone()
    cursor.close()
    if result:
        return jsonify({'mensagem': 'Ultimo serviço localizado com sucesso!', 'lastOsCode': result})
    else:
        return jsonify({'mensagem': 'Ultimo serviço não encontrado!'}), 404


@api_servicos.route('/servicos/update_status/<int:numeroOrdem>', methods=['PATCH'])
@jwt_required()
def update_servico_status(numeroOrdem):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()

    # Verifique se o serviço com o número de ordem especificado existe
    sql_servico = 'SELECT status FROM servicos WHERE numeroOrdem = %s'
    cursor.execute(sql_servico, (numeroOrdem,))
    servico = cursor.fetchone()

    if servico is None:
        return jsonify({'message': 'Serviço não encontrado'}), 404

    data = request.get_json()
    novo_status = data.get('status')

    if novo_status is None:
        return jsonify({'message': 'O campo "status" é obrigatório'}), 400

    # Atualize o campo "status" do serviço
    sql_update_status = 'UPDATE servicos SET status = %s WHERE numeroOrdem = %s'
    cursor.execute(sql_update_status, (novo_status, numeroOrdem))
    db.commit()

    return jsonify({'message': 'Status atualizado com sucesso'})
