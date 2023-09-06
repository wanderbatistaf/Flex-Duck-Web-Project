import json
import time
from datetime import datetime

import mysql.connector

from flask import Blueprint
from flask import Flask, jsonify, request, abort, Response
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from Controller.db_connection import get_db_connection

api_products = Blueprint('api_products', __name__)


# API PRODUCTS #
# Define a rota GET para buscar dados do banco de dados
@api_products.route('/products', methods=['GET'])
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
            cursor.execute('SELECT * FROM produtos_servicos where is_product = 1')
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
    for row in resultados:
        item = {
            'id': row[0],
            'codigo': row[1],
            'descricao': row[2],
            'nome': row[3],
            'categoria': row[4],
            'marca': row[5],
            'preco_venda': row[6],
            'preco_custo': row[7],
            'margem_lucro': row[8],
            'desconto': row[9],
            'quantidade': row[10],
            'localizacao': row[11],
            'estoque_minimo': row[12],
            'estoque_maximo': row[13],
            'alerta_reposicao': row[14],
            'fornecedor_id': row[15],
            'fornecedor_nome': row[16]
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)

# Define a rota GET para buscar dados do banco de dados especifico
@api_products.route('/products/<int:id>', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados_produtos(id):
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
            sql = 'SELECT * FROM produtos_servicos WHERE id = %s'
            val = (id,)
            cursor.execute(sql, val)
            result = cursor.fetchone()
            cursor.close()
            break  # Sai do loop se a consulta foi bem-sucedida
        except mysql.connector.errors.OperationalError:
            current_attempt += 1
            if current_attempt == max_attempts:
                print("Erro de conexão com o banco de dados após várias tentativas. Verifique a conexão e tente novamente mais tarde.")
                return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500
            else:
                time.sleep(2)  # Pausa de 2 segundos antes de tentar novamente

    if result:
        return jsonify({'mensagem': 'Produto localizado com sucesso!', 'produto': result})
    else:
        return jsonify({'mensagem': 'Produto não encontrado!'}), 404


# Define a rota GET para buscar dados do banco de dados especifico
@api_products.route('/products/<string:codigo>', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados_produtos_codigo(codigo):
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
            sql = 'SELECT * FROM produtos_servicos WHERE codigo = %s'
            val = (codigo,)
            cursor.execute(sql, val)
            result = cursor.fetchone()
            cursor.close()
            break  # Sai do loop se a consulta foi bem-sucedida
        except mysql.connector.errors.OperationalError:
            current_attempt += 1
            if current_attempt == max_attempts:
                print("Erro de conexão com o banco de dados após várias tentativas. Verifique a conexão e tente novamente mais tarde.")
                return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500
            else:
                time.sleep(2)  # Pausa de 2 segundos antes de tentar novamente

    if result:
        return jsonify({'mensagem': 'Produto localizado com sucesso!', 'produto': result})
    else:
        return jsonify({'mensagem': 'Produto não encontrado!'}), 404


# Define a rota POST para inserir dados no banco de dados
@api_products.route('/products/add', methods=['POST'])
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
    print(dados)
    cursor = db.cursor()
    sql = 'INSERT INTO produtos_servicos (codigo, descricao, nome, categoria,marca,preco_venda, preco_custo, margem_lucro, quantidade, localizacao, estoque_minimo, estoque_maximo, alerta_reposicao, fornecedor_id, created_at, fornecedor_nome    ) VALUES (%s, %s, %s, %s,%s, %s, %s, %s,%s, %s, %s, %s,%s, %s, %s, %s)'
    val = (dados['codigo'], dados['descricao'], dados['nome'], dados['categoria'],dados['marca'],dados['preco_venda'], dados['preco_custo'], dados['margem_lucro'], dados['quantidade'], dados['localizacao'], dados['estoque_minimo'], dados['estoque_maximo'], dados['alerta_reposicao'], dados['fornecedor_id'], dados['created_at'], dados['fornecedor_nome'])
    cursor.execute(sql, val)
    db.commit()
    print(cursor)
    cursor.close()
    return jsonify({'mensagem': 'Dados inseridos com sucesso!'})

# Define a rota PUT para atualizar dados no banco de dados
@api_products.route('/products/update/<int:id>', methods=['PUT'])
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
    sql = 'UPDATE produtos_servicos SET codigo = %s, descricao = %s, nome = %s, categoria = %s, marca = %s, preco_venda = %s, preco_custo = %s, margem_lucro = %s , quantidade = %s, localizacao = %s, estoque_minimo = %s, estoque_maximo = %s, alerta_reposicao = %s, fornecedor_id = %s, fornecedor_nome = %s WHERE id = %s'
    val = (dados['codigo'], dados['descricao'], dados['nome'], dados['categoria'], dados['marca'], dados['preco_venda'], dados['preco_custo'], dados['margem_lucro'], dados['quantidade'], dados['localizacao'], dados['estoque_minimo'], dados['estoque_maximo'], dados['alerta_reposicao'], dados['fornecedor_id'], dados['fornecedor_nome'], id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})

# Define a rota DELETE para excluir dados do banco de dados
@api_products.route('/products/delete/<int:id>', methods=['DELETE'])
@jwt_required() # Protege a rota com JWT
def excluir_dados(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()
    sql = 'DELETE FROM produtos_servicos WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados excluídos com sucesso!'})

@api_products.route('/products/lastCode/<string:is_product>', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados_user(is_product):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()
    sql = 'SELECT max(created_at) as created_at, id, codigo, is_product FROM produtos_servicos WHERE is_product = %s group by 2,3 ORDER BY 1 DESC LIMIT 1'
    val = (is_product,)
    cursor.execute(sql, val)
    result = cursor.fetchone()
    cursor.close()
    if result:
        return jsonify({'mensagem': 'Produto localizado com sucesso!', 'produto': result})
    else:
        return jsonify({'mensagem': 'Produto não encontrado!'}), 404


# Define a rota PUT para atualizar dados no banco de dados
@api_products.route('/products/shortcut/update/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_dados_atalho(id):
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
    sql = 'UPDATE produtos_servicos SET quantidade = %s WHERE id = %s'
    val = (dados['quantidade'], id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})


# Cadastro de variações de tamanho de produtos
@api_products.route('/products/add_variations', methods=['POST'])
@jwt_required()
def inserir_variacoes():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    variacoes = request.json  # Recebe a lista de variações

    print(variacoes)

    cursor = db.cursor()
    sql = ('INSERT INTO produtos_servicos (codigo, descricao, nome, categoria, marca, preco_venda, preco_custo, '
           'margem_lucro, quantidade, localizacao, estoque_minimo, estoque_maximo, alerta_reposicao, fornecedor_id, '
           'created_at, fornecedor_nome) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)')

    # Loop para inserir cada variação na base de dados
    for variacao in variacoes:
        val = (
            variacao['sku'],  # Usando o SKU como "codigo"
            variacao['descricao'],
            variacao['nome'],
            variacao['categoria'],
            variacao['marca'],
            variacao['preco_venda'],
            variacao['preco_custo'],
            variacao['margem_lucro'],
            variacao['quantity'],
            variacao['localizacao'],
            variacao['estoque_minimo'],
            variacao['estoque_maximo'],
            variacao['alerta_reposicao'],
            variacao['fornecedor_id'],
            datetime.now(),  # Use a função datetime.now() para obter a data e hora atual
            variacao['fornecedor_nome']
        )
        cursor.execute(sql, val)

    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Variações inseridas com sucesso!'})


# Capturar se já existe o produto igual ou similar no banco para sugerir preço
@api_products.route('/products/suggest_price/<string:product_name>', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def suggest_price_for_product(product_name):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)

    try:
        cursor = db.cursor()
        sql = 'SELECT codigo, preco_venda, categoria FROM produtos_servicos WHERE nome LIKE %s ORDER BY created_at DESC LIMIT 1'
        val = ('%' + product_name + '%',)
        cursor.execute(sql, val)
        result = cursor.fetchone()
        cursor.close()
    except mysql.connector.errors.OperationalError:
        print("Erro de conexão com o banco de dados. Verifique a conexão e tente novamente mais tarde.")
        return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500

    if result:
        category_suggested = result[2]
        suggested_price = result[1]
        product_code_full  = result[0]

        # Extract the raw product code (without variant) from the full product code
        product_code = product_code_full.split(' ')[0]

        return jsonify({'mensagem': 'Produto localizado com sucesso!', 'product_code': product_code, 'suggested_price': suggested_price,
                        'category_suggested': category_suggested})
    else:
        return jsonify({'mensagem': 'Produto não encontrado!', 'suggested_price': '0,00'}), 200







# @api_products.route('/products/increment/<int:id>', methods=['PUT'])
# @jwt_required()
# def incrementar_quantidade(id):
#     current_user = get_jwt_identity()
#     if not current_user:
#         return abort(404)
#
#     cursor = db.cursor()
#     # Consultar a quantidade atual do produto
#     cursor.execute('SELECT quantidade FROM produtos_servicos WHERE id = %s', (id,))
#     quantidade_atual = cursor.fetchone()[0]
#
#     # Incrementar a quantidade em 1
#     nova_quantidade = quantidade_atual + 1
#
#     # Atualizar a quantidade no banco de dados
#     cursor.execute('UPDATE produtos_servicos SET quantidade = %s WHERE id = %s', (nova_quantidade, id))
#     db.commit()
#     cursor.close()
#
#     return jsonify({'mensagem': 'Quantidade incrementada com sucesso!'})
#
#
# @api_products.route('/products/decrement/<int:id>', methods=['PUT'])
# @jwt_required()
# def decrementar_quantidade(id):
#     current_user = get_jwt_identity()
#     if not current_user:
#         return abort(404)
#
#     cursor = db.cursor()
#     # Consultar a quantidade atual do produto
#     cursor.execute('SELECT quantidade FROM produtos_servicos WHERE id = %s', (id,))
#     quantidade_atual = cursor.fetchone()[0]
#
#     # Verificar se a quantidade atual é maior que 0 antes de decrementar
#     if quantidade_atual > 0:
#         nova_quantidade = quantidade_atual - 1
#
#         # Atualizar a quantidade no banco de dados
#         cursor.execute('UPDATE produtos_servicos SET quantidade = %s WHERE id = %s', (nova_quantidade, id))
#         db.commit()
#
#     cursor.close()
#
#     return jsonify({'mensagem': 'Quantidade decrementada com sucesso!'})



