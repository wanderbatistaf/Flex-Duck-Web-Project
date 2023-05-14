from flask import Blueprint
from flask import Flask, jsonify, request, abort
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from Controller import mysql_connector

api_users = Blueprint('api_users', __name__)

# Configura a conexão com o banco de dados MySQL
db = mysql_connector.db

# API USERS #
# Define a rota GET para buscar dados do banco de dados
@api_users.route('/users', methods=['GET'])
# @jwt_required() # Protege a rota com JWT
def buscar_dados():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    cursor = db.cursor()
    cursor.execute('SELECT * FROM usuarios')
    resultados = cursor.fetchall()
    cursor.close()
    items = []
    for row in resultados:
        item = {
            "user_id": row[0],
            "username": row[1],
            "name": row[2],
            "password": row[3],
            "active": row[4],
            "email": row[5],
            "created_at": row[6],
            "last_login": row[7],
            "level": row[8]
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(resultados)

# Define a rota POST para inserir dados no banco de dados
@api_users.route('/users', methods=['POST'])
def inserir_dados():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    cursor = db.cursor()
    sql = 'INSERT INTO usuarios (campo1, campo2) VALUES (%s, %s)'
    val = (dados['campo1'], dados['campo2'])
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados inseridos com sucesso!'})

# Define a rota PUT para atualizar dados no banco de dados
@api_users.route('/users/<int:id>', methods=['PUT'])
def atualizar_dados(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    cursor = db.cursor()
    sql = 'UPDATE usuarios SET campo1 = %s, campo2 = %s WHERE id = %s'
    val = (dados['campo1'], dados['campo2'], id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})

# Define a rota DELETE para excluir dados do banco de dados
@api_users.route('/users/<int:id>', methods=['DELETE'])
def excluir_dados(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    cursor = db.cursor()
    sql = 'DELETE FROM usuarios WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados excluídos com sucesso!'})