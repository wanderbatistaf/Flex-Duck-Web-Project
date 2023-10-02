import time
import mysql.connector


from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

from Controller.db_connection import get_db_connection

notifys_api = Blueprint('notifys_api', __name__)

@notifys_api.route('/notify/products', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def alerta_reposicao():
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
            cursor.execute('SELECT * FROM produtos_servicos where is_product = 1 and quantidade <= alerta_reposicao')
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
