import json
from flask import Blueprint
from flask import Flask, jsonify, request, abort, Response
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from Controller import mysql_connector

api_products = Blueprint('api_products', __name__)

# Configura a conexão com o banco de dados MySQL
db = mysql_connector.db

# API PRODUCTS #
# Define a rota GET para buscar dados do banco de dados
@api_products.route('/products', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    cursor = db.cursor()
    cursor.execute('SELECT * FROM produtos_servicos where is_product = 1')
    resultados = cursor.fetchall()
    print(resultados)
    cursor.close()
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
    cursor = db.cursor()
    sql = 'SELECT * FROM produtos_servicos WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    result = cursor.fetchone()
    cursor.close()
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
    dados = request.json
    print(dados)
    cursor = db.cursor()
    sql = 'INSERT INTO produtos_servicos (codigo, descricao, nome, categoria,marca,preco_venda, preco_custo, margem_lucro, quantidade, localizacao, estoque_minimo, estoque_maximo, alerta_reposicao, fornecedor_id, created_at    ) VALUES (%s, %s, %s, %s,%s, %s, %s, %s,%s, %s, %s, %s,%s, %s, %s)'
    val = (dados['codigo'], dados['descricao'], dados['nome'], dados['categoria'],dados['marca'],dados['preco_venda'], dados['preco_custo'], dados['margem_lucro'], dados['quantidade'], dados['localizacao'], dados['estoque_minimo'], dados['estoque_maximo'], dados['alerta_reposicao'], dados['fornecedor_id'], dados['created_at'])
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
    dados = request.json
    print(dados)
    cursor = db.cursor()
    sql = 'UPDATE produtos_servicos SET id= %s, codigo= %s, descricao= %s, nome= %s, categoria= %s,marca= %s,preco_venda= %s, preco_custo= %s, margem_lucro= %s, desconto= %s, quantidade= %s, localizacao= %s, estoque_minimo= %s, estoque_maximo= %s, alerta_reposicao= %s, fornecedor_id= %s'
    val = (dados['id'], dados['codigo'], dados['descricao'], dados['nome'], dados['categoria'],dados['marca'],dados['preco_venda'], dados['preco_custo'], dados['margem_lucro'], dados['desconto'], dados['quantidade'], dados['localizacao'], dados['estoque_minimo'], dados['estoque_maximo'], dados['alerta_reposicao'], dados['fornecedor_id'])
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
    cursor = db.cursor()
    sql = 'DELETE FROM produtos_servicos WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados excluídos com sucesso!'})

@api_products.route('/products/lastCode/<int:is_product>', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados_user(is_product):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
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

