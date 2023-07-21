from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql.connector

from Controller.mysql_connector import get_db_connection
from Controller.mysql_connector import reconnect_db

api_bandeiras = Blueprint('api_bandeiras', __name__)

# Configura a conexão com o banco de dados MySQL
db = get_db_connection()

# Função para reconectar ao banco de dados
def reconnect_db():
    db.ping(reconnect=True)


# API para buscar todas as bandeiras
@api_bandeiras.route('/bandeiras', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_todas_bandeiras():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        reconnect_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM bandeiras')
        resultados = cursor.fetchall()
        cursor.close()

        bandeiras = []
        for row in resultados:
            bandeira = {
                "bandeira_id": row[0],
                "descricao": row[1]
            }
            bandeiras.append(bandeira)

        return jsonify(bandeiras)

    except mysql.connector.errors.OperationalError as e:
        print("Erro de conexão com o banco de dados: ", str(e))
        return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500


# API para buscar uma bandeira específica
@api_bandeiras.route('/bandeiras/<int:bandeira_id>', methods=['GET'])
@jwt_required()  # Protege a rota com JWT
def buscar_bandeira(bandeira_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        reconnect_db()
        cursor = db.cursor()
        sql = 'SELECT * FROM bandeiras WHERE bandeira_id = %s'
        val = (bandeira_id,)
        cursor.execute(sql, val)
        result = cursor.fetchone()
        cursor.close()

        if result:
            bandeira = {
                "bandeira_id": result[0],
                "descricao": result[1]
            }
            return jsonify(bandeira)
        else:
            return jsonify({'mensagem': 'Bandeira não encontrada!'}), 404

    except mysql.connector.errors.OperationalError as e:
        print("Erro de conexão com o banco de dados: ", str(e))
        return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500


# API para inserir uma nova bandeira
@api_bandeiras.route('/bandeiras/add', methods=['POST'])
@jwt_required()  # Protege a rota com JWT
def inserir_bandeira():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        dados = request.json
        reconnect_db()
        cursor = db.cursor()
        sql = 'INSERT INTO bandeiras (descricao) VALUES (%s)'
        val = (dados['descricao'],)
        cursor.execute(sql, val)
        db.commit()
        cursor.close()
        return jsonify({'mensagem': 'Bandeira inserida com sucesso!'})

    except Exception as e:
        db.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500


# API para atualizar dados de uma bandeira
@api_bandeiras.route('/bandeiras/update/<int:bandeira_id>', methods=['PUT'])
@jwt_required()  # Protege a rota com JWT
def atualizar_bandeira(bandeira_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        dados = request.json
        reconnect_db()
        cursor = db.cursor()
        sql = 'UPDATE bandeiras SET descricao = %s WHERE bandeira_id = %s'

        val = (dados['descricao'], bandeira_id)
        cursor.execute(sql, val)
        db.commit()
        cursor.close()
        return jsonify({'mensagem': 'Bandeira atualizada com sucesso!'})

    except Exception as e:
        db.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500


# API para excluir uma bandeira
@api_bandeiras.route('/bandeiras/delete/<int:bandeira_id>', methods=['DELETE'])
@jwt_required()  # Protege a rota com JWT
def excluir_bandeira(bandeira_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        reconnect_db()
        cursor = db.cursor()
        sql = 'DELETE FROM bandeiras WHERE bandeira_id = %s'
        val = (bandeira_id,)
        cursor.execute(sql, val)
        db.commit()
        cursor.close()
        return jsonify({'mensagem': 'Bandeira excluída com sucesso!'})

    except Exception as e:
        db.rollback()
        print(str(e))
        return jsonify({'erro': str(e)}), 500
