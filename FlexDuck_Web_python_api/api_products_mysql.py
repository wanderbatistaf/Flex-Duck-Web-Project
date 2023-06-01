from flask import Blueprint
from flask import Flask, jsonify, request, abort
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from Controller import mysql_connector

api_products = Blueprint('api_products', __name__)

# Configura a conexão com o banco de dados MySQL
db = mysql_connector.db

# API SUPPLIERS #
# Define a rota GET para buscar dados do banco de dados
@api_products.route('/products', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    cursor = db.cursor()
    cursor.execute('SELECT * FROM produtos')
    resultados = cursor.fetchall()
    cursor.close()
    items = []
    for row in resultados:
        item = {
            'codigo': row[0] ,
            'descricao': row[1],
            'nome': row[2],
            'categoria': row[3],
            'marca': row[4],
            'preco_venda': row[5],
            'preco_custo': row[6],
            'margem_lucro': row[7],
            'desconto': row[8],
            'quantidade': row[9],
            'localizacao': row[10],
            'estoque_minimo': row[11],
            'estoque_maximo': row[12],
            'alerta_reposicao': row[13],
            'fornecedor_id': row[14],
            'client_id': row[15],
        }
        items.append(item)

    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)
