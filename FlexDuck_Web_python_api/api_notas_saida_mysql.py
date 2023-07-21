import time
import mysql.connector

from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

from Controller.mysql_connector import get_db_connection
from Controller.mysql_connector import reconnect_db

api_notas_saida = Blueprint('api_notas_saida', __name__)

# Configura a conexão com o banco de dados MySQL
db = get_db_connection()

# Função para reconectar ao banco de dados
def reconnect_db():
    db.ping(reconnect=True)

# API NOTAS ENTRADA #
# Define a rota GET para buscar dados das notas de saída
@api_notas_saida.route('/notas-saida', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_notas_saida():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Número máximo de tentativas
    max_attempts = 3
    current_attempt = 0

    while current_attempt < max_attempts:
        try:
            reconnect_db()
            cursor = db.cursor()
            cursor.execute('SELECT * FROM notas_saida')
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
            'contabilidade_id': row[1],
            'data': row[2],
            'valor': row[3],
            'descricao': row[4]
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)

# Define a rota POST para inserir dados de notas de saída no banco de dados
@api_notas_saida.route('/notas-saida/add', methods=['POST'])
@jwt_required()
def inserir_notas_saida():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    print(dados)
    reconnect_db()
    cursor = db.cursor()
    sql = 'INSERT INTO notas_saida (contabilidade_id, data, valor, descricao) VALUES (%s, %s, %s, %s)'
    val = (dados['contabilidade_id'], dados['data'], dados['valor'], dados['descricao'])
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados de notas de saída inseridos com sucesso!'})

# Define a rota PUT para atualizar dados das notas de saída no banco de dados
@api_notas_saida.route('/notas-saida/update/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_notas_saida(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    print(dados)
    reconnect_db()
    cursor = db.cursor()
    sql = 'UPDATE notas_saida SET contabilidade_id = %s, data = %s, valor = %s, descricao = %s WHERE id = %s'
    val = (dados['contabilidade_id'], dados['data'], dados['valor'], dados['descricao'], id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados de notas de saída atualizados com sucesso!'})

# Define a rota DELETE para excluir dados das notas de saída do banco de dados
@api_notas_saida.route('/notas-saida/delete/<int:id>', methods=['DELETE'])
@jwt_required() # Protege a rota com JWT
def excluir_notas_saida(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    reconnect_db()
    cursor = db.cursor()
    sql = 'DELETE FROM notas_saida WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados de notas de saída excluídos com sucesso!'})
