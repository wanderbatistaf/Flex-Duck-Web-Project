import time
import json
import mysql.connector

from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

from Controller.db_connection import get_db_connection

api_contabilidade = Blueprint('api_contabilidade', __name__)


# API CONTABILIDADE #
# Define a rota GET para buscar dados do banco de dados
@api_contabilidade.route('/contabilidade', methods=['GET'])
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
            cursor.execute('SELECT * FROM contabilidade')
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
            'receita': float(row[1]),
            'despesa': float(row[2]),
            'lucro': float(row[3]),
            'contas_receber': row[4],
            'contas_pagar': row[5],
            'nota_entrada': float(row[6]),
            'nota_saida': float(row[7])
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)

# Define a rota GET para buscar dados do banco de dados especifico
@api_contabilidade.route('/contabilidade/<int:id>', methods=['GET'])
@jwt_required()
def buscar_dados_contabilidade(id):
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
            cursor.execute('SELECT * FROM contabilidade WHERE id=%s', (id,))
            resultados = cursor.fetchall()
            cursor.close()
            break  # Sai do loop se a consulta foi bem-sucedida
        except mysql.connector.errors.OperationalError:
            current_attempt += 1
            if current_attempt == max_attempts:
                print(
                    "Erro de conexão com o banco de dados após várias tentativas. Verifique a conexão e tente novamente mais tarde.")
                return jsonify({'mensagem': 'Erro de conexão com o banco de dados.'}), 500
            else:
                time.sleep(2)  # Pausa de 2 segundos antes de tentar novamente

    items = []
    for row in resultados:
        item = {
            'id': row[0],
            'receita': float(row[1]),
            'despesa': float(row[2]),
            'lucro': float(row[3]),
            'contas_receber': row[4],
            'contas_pagar': row[5],
            'nota_entrada': float(row[6]),
            'nota_saida': float(row[7])
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)


# Define a rota POST para inserir dados no banco de dados
@api_contabilidade.route('/contabilidade/add', methods=['POST'])
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
    sql = 'INSERT INTO contabilidade (receita, despesa, lucro, contas_receber, contas_pagar, nota_entrada, nota_saida) VALUES (%s, %s, %s, %s, %s, %s, %s)'
    val = (dados['receita'], dados['despesa'], dados['lucro'], dados['contas_receber'], dados['contas_pagar'], dados['nota_entrada'], dados['nota_saida'])
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados inseridos com sucesso!'})

# Define a rota PUT para atualizar dados no banco de dados
@api_contabilidade.route('/contabilidade/update/<int:id>', methods=['PUT'])
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
    sql = 'UPDATE contabilidade SET receita = %s, despesa = %s, lucro = %s, contas_receber = %s, contas_pagar = %s, nota_entrada = %s, nota_saida = %s WHERE id = %s'
    val = (dados['receita'], dados['despesa'], dados['lucro'], dados['contas_receber'], dados['contas_pagar'], dados['nota_entrada'], dados['nota_saida'], id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})

# Define a rota DELETE para excluir dados do banco de dados
@api_contabilidade.route('/contabilidade/delete/<int:id>', methods=['DELETE'])
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
    sql = 'DELETE FROM contabilidade WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados excluídos com sucesso!'})