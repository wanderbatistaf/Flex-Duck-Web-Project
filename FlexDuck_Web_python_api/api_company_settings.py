import time

from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import mysql.connector

from Controller.db_connection import get_db_connection

api_company_settings = Blueprint('api_company_settings', __name__)


# Define a rota GET para buscar dados do banco de dados
@api_company_settings.route('/company_settings', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_todos_dados_client():
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
            cursor.execute('SELECT * FROM company_settings')
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
            "id": row[0],
            "razao_social": row[1],
            "nome_fantasia": row[2],
            "cnpj": row[3],
            "state_registration": row[4],
            "municipal_registration": row[5],
            "telephone": row[6],
            "city": row[7],
            "street": row[8],
            "district": str(row[9]),
            "state": str(row[10]),
            "number": str(row[11]),
            "complement": row[12],
            "country": row[13],
            "cep": row[14],
            "created_at": row[15],
            "codigo_regime_tributario": row[16],
            "pix_key": row[17]
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)

# Define a rota PUT para atualizar dados no banco de dados
@api_company_settings.route('/company_settings/att/<int:id>', methods=['PUT'])
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
    sql = '''
        UPDATE company_settings SET
            razao_social = %s, nome_fantasia = %s, cnpj = %s, state_registration = %s,
            municipal_registration = %s, telephone = %s, city = %s, street = %s,
            district = %s, state = %s, number = %s, complement = %s, country = %s,
            cep = %s, created_at = %s, codigo_regime_tributario = %s, pix_key = %s
        WHERE id = %s
    '''
    val = (
        dados['razao_social'], dados['nome_fantasia'], dados['cnpj'], dados['state_registration'],
        dados['municipal_registration'], dados['telephone'], dados['city'], dados['street'],
        dados['district'], dados['state'], dados['number'], dados['complement'], dados['country'],
        dados['cep'], dados['created_at'], dados['codigo_regime_tributario'], dados['pix_key'], id
    )
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})



