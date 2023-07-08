from flask import Blueprint
from flask import Flask, jsonify, request, abort
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from Controller.mysql_connector import get_db_connection
from Controller.mysql_connector import reconnect_db

api_users = Blueprint('api_users', __name__)

# Configura a conexão com o banco de dados MySQL
db = get_db_connection()

# API USERS #
# Define a rota GET para buscar dados do banco de dados
@api_users.route('/users', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    reconnect_db()
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
    return jsonify(response)

# Define a rota GET para buscar dados do banco de dados especifico
@api_users.route('/users/<int:user_id>', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados_user(user_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    reconnect_db()
    cursor = db.cursor()
    sql = 'SELECT * FROM usuarios WHERE user_id = %s'
    val = (user_id,)
    cursor.execute(sql, val)
    result = cursor.fetchone()
    print(result)
    cursor.close()
    if result:
        return jsonify({'mensagem': 'Cliente localizado com sucesso!', 'cliente': result})
    else:
        return jsonify({'mensagem': 'Cliente não encontrado!'}), 404

# Define a rota POST para inserir dados no banco de dados
@api_users.route('/users/add', methods=['POST'])
@jwt_required()
def inserir_dados():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    reconnect_db()
    cursor = db.cursor()
    sql = 'INSERT INTO usuarios (username, name, password, active, email, created_at, level) VALUES (%s, %s, %s, %s, %s, %s, %s)'
    val = (dados['username'], dados['name'], dados['password'], dados['active'], dados['email'], dados['created_at'], dados['level'])
    cursor.execute(sql, val)
    db.commit()
    print(cursor)
    cursor.close()
    return jsonify({'mensagem': 'Dados inseridos com sucesso!'})

# Define a rota PUT para atualizar dados no banco de dados
@api_users.route('/users/update/<int:user_id>', methods=['PUT'])
@jwt_required()
def atualizar_dados(user_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    reconnect_db()
    cursor = db.cursor()
    sql = 'UPDATE usuarios SET username = %s, name = %s, password = %s, active = %s, email = %s, ' \
          'level = %s WHERE user_id = %s'
    val = (dados['username'], dados['name'], dados['password'], dados['active'], dados['email'],
           dados['level'], user_id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})

# Define a rota DELETE para excluir dados do banco de dados
@api_users.route('/users/delete/<int:user_id>', methods=['DELETE'])
@jwt_required() # Protege a rota com JWT
def excluir_dados(user_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    reconnect_db()
    cursor = db.cursor()
    sql = 'DELETE FROM usuarios WHERE user_id = %s'
    val = (user_id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados excluídos com sucesso!'})

# Define a rota para obter o último ID de usuário
@api_users.route('/users/lastUserId', methods=['GET'])
@jwt_required()
def get_last_user_id():
    try:
        current_user = get_jwt_identity()
        if not current_user:
            return abort(404)
        reconnect_db()
        cursor = db.cursor()
        cursor.execute('SELECT MAX(user_id) FROM usuarios')
        last_user_id = cursor.fetchone()[0]
        cursor.close()
        response = jsonify(last_user_id)
        return response
    except Exception as e:
        return jsonify(error=str(e)), 500

# Define a rota PUT para atualizar data de acesso no banco de dados
@api_users.route('/users/update/access-date/<int:user_id>', methods=['PUT'])
@jwt_required()
def atualizar_login_access(user_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    reconnect_db()
    cursor = db.cursor()
    sql = 'UPDATE usuarios SET last_login = %s WHERE user_id = %s'
    val = (dados['last_login'], user_id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})