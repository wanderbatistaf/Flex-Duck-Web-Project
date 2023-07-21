from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql.connector

from Controller.mysql_connector import get_db_connection
from Controller.mysql_connector import reconnect_db

api_forma_pagamento = Blueprint('api_forma_pagamento', __name__)


# Configura a conexão com o banco de dados MySQL
db = get_db_connection()

# Função para reconectar ao banco de dados
def reconnect_db():
    db.ping(reconnect=True)


# API para buscar todas as formas de pagamento
@api_forma_pagamento.route('/forma_pagamento', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_todas_formas_pagamento():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        reconnect_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM forma_pagamento')
        resultados = cursor.fetchall()
        cursor.close()

        formas_pagamento = []
        for row in resultados:
            forma_pagamento = {
                "forma_pagamento_id": row[0],
                "descricao": row[1]
            }
            formas_pagamento.append(forma_pagamento)

        return jsonify(formas_pagamento)

    except mysql.connector.errors.OperationalError as e:
        print("Erro de conexão com o banco de dados: ", str(e))
        return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500


# API para buscar uma forma de pagamento específica
@api_forma_pagamento.route('/forma_pagamento/<int:forma_pagamento_id>', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_forma_pagamento(forma_pagamento_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        reconnect_db()
        cursor = db.cursor()
        sql = 'SELECT * FROM forma_pagamento WHERE forma_pagamento_id = %s'
        val = (forma_pagamento_id,)
        cursor.execute(sql, val)
        result = cursor.fetchone()
        cursor.close()

        if result:
            forma_pagamento = {
                "forma_pagamento_id": result[0],
                "descricao": result[1]
            }
            return jsonify(forma_pagamento)
        else:
            return jsonify({'mensagem': 'Forma de pagamento não encontrada!'}), 404

    except mysql.connector.errors.OperationalError as e:
        print("Erro de conexão com o banco de dados: ", str(e))
        return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500


# API para inserir uma nova forma de pagamento
@api_forma_pagamento.route('/forma_pagamento/add', methods=['POST'])
@jwt_required()  # Protege a rota com JWT
def inserir_forma_pagamento():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        dados = request.json
        reconnect_db()
        cursor = db.cursor()
        sql = 'INSERT INTO forma_pagamento (descricao) VALUES (%s)'
        val = (dados['descricao'],)
        cursor.execute(sql, val)
        db.commit()
        cursor.close()
        return jsonify({'mensagem': 'Forma de pagamento inserida com sucesso!'})

    except Exception as e:
        db.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500


# API para atualizar dados de uma forma de pagamento
@api_forma_pagamento.route('/forma_pagamento/update/<int:forma_pagamento_id>', methods=['PUT'])
@jwt_required()  # Protege a rota com JWT
def atualizar_forma_pagamento(forma_pagamento_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        dados = request.json
        reconnect_db()
        cursor = db.cursor()
        sql = 'UPDATE forma_pagamento SET descricao = %s WHERE forma_pagamento_id = %s'

        val = (dados['descricao'], forma_pagamento_id)
        cursor.execute(sql, val)
        db.commit()
        cursor.close()
        return jsonify({'mensagem': 'Forma de pagamento atualizada com sucesso!'})

    except Exception as e:
        db.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500


# API para excluir uma forma de pagamento
@api_forma_pagamento.route('/forma_pagamento/delete/<int:forma_pagamento_id>', methods=['DELETE'])
@jwt_required()  # Protege a rota com JWT
def excluir_forma_pagamento(forma_pagamento_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        reconnect_db()
        cursor = db.cursor()
        sql = 'DELETE FROM forma_pagamento WHERE forma_pagamento_id = %s'
        val = (forma_pagamento_id,)
        cursor.execute(sql, val)
        db.commit()
        cursor.close()
        return jsonify({'mensagem': 'Forma de pagamento excluída com sucesso!'})

    except Exception as e:
        db.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500
