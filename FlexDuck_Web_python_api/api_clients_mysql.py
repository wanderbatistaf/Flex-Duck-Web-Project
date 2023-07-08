from datetime import datetime

from flask import Blueprint
from flask import Flask, jsonify, request, abort
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity


from Controller.mysql_connector import get_db_connection
from Controller.mysql_connector import reconnect_db

api_clients = Blueprint('api_clients', __name__)


# Configura a conexão com o banco de dados MySQL
db = get_db_connection()

@api_clients.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


# API CLIENTS #
# Define a rota GET para buscar dados do banco de dados
@api_clients.route('/clients', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_todos_dados_client():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    reconnect_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM clients')
    resultados = cursor.fetchall()
    cursor.close()
    items = []
    for row in resultados:
        item = {
            "client_id": row[0],
            "business_name": row[1],
            "firstname": row[2],
            "lastname": row[3],
            "cnpj_cpf": row[4],
            "state_registration": row[5],
            "municipal_registration": row[6],
            "telephone": row[7],
            "email": row[8],
            "created_at": str(row[9]),
            "inactive_since": str(row[10]),
            "blocked_since": str(row[11]),
            "cep": row[12],
            "street": row[13],
            "district": row[14],
            "city": row[15],
            "state": row[16],
            "natural_person": row[17],
            "inactive_status": row[18],
            "blocked_status": row[19],
            "number": row[20],
            "complement": row[21],
            "gender": row[22]
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)


# Define a rota GET para buscar dados do banco de dados especifico
@api_clients.route('/clients/<int:client_id>', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados_cliente(client_id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    reconnect_db()
    cursor = db.cursor()
    sql = 'SELECT * FROM clients WHERE client_id = %s'
    val = (client_id,)
    cursor.execute(sql, val)
    result = cursor.fetchone()
    cursor.close()
    if result:
        return jsonify({'mensagem': 'Cliente localizado com sucesso!', 'cliente': result})
    else:
        return jsonify({'mensagem': 'Cliente não encontrado!'}), 404




#Define a rota POST para inserir dados no banco de dados
@api_clients.route('/clients/add', methods=['POST'])
@jwt_required() # Protege a rota com JWT
#Eu confio em você, voa beija-flor, eu confio em você -Saile
def inserir_dados_client():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    try:
        dados = request.json
        dados['created_at'] = datetime.now()
        # Check if business_name is null or undefined
        if not dados.get('business_name'):
            dados['business_name'] = f"{dados['firstname']} {dados['lastname']}"
        print(dados)
        reconnect_db()
        cursor = db.cursor()
        sql = 'INSERT INTO clients (business_name, firstname, lastname, cnpj_cpf, telephone, email, blocked_since, cep,' \
              ' created_at, district, gender, inactive_since, natural_person, number, state, street, ' \
              'complement, city) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
        val = (
            dados['business_name'],
            dados['firstname'], dados['lastname'], dados['cnpj_cpf'], dados['telephone'], dados['email'],
            dados['blocked_since'],
            dados['cep'], dados['created_at'], dados['district'], dados['gender'],
            dados['inactive_since'],
            dados['natural_person'], dados['number'], dados['state'], dados['street'],
            dados['complement'],
            dados['city']
        )
        dados.setdefault('blocked_status', False)
        dados.setdefault('inactive_status', False)
        print(val)
        cursor.execute(sql, val)
        db.commit()
        print('Salvo no BD!')
        cursor.close()
        print('Salvo no BD!')

        return jsonify({'mensagem': 'Dados inseridos com sucesso!'})

    except Exception as e:
        db.rollback()
        print(str(e))
        return jsonify({'erro': str(e)})



# Define a rota PUT para atualizar dados no banco de dados
@api_clients.route('/clients/update/<int:id>', methods=['PUT'])
@jwt_required() # Protege a rota com JWT
def atualizar_dados_client(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    reconnect_db()
    cursor = db.cursor()
    sql = 'UPDATE clients SET business_name = %s, firstname = %s, lastname = %s, cnpj_cpf = %s, telephone = %s, ' \
          'email = %s, blocked_since = %s, cep = %s, district = %s, gender = %s, inactive_since = %s, ' \
          'natural_person = %s, number = %s, state = %s, street = %s, complement = %s, city = %s WHERE client_id = %s'

    val = (dados['business_name'], dados['firstname'], dados['lastname'], dados['cnpj_cpf'], dados['telephone'],
           dados['email'], dados['blocked_since'], dados['cep'], dados['district'], dados['gender'],
           dados['inactive_since'], dados['natural_person'], dados['number'], dados['state'], dados['street'],
           dados['complement'], dados['city'], id)
    cursor.execute(sql, val)
    db.commit()
    print(cursor)
    print(dados)
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})


# Define a rota DELETE para excluir dados do banco de dados
@api_clients.route('/clients/delete/<int:id>', methods=['DELETE'])
@jwt_required() # Protege a rota com JWT
def excluir_dados_client(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    reconnect_db()
    cursor = db.cursor()
    sql = 'DELETE FROM clients WHERE client_id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados excluídos com sucesso!'})

