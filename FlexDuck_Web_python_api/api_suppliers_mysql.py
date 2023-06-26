from flask import Blueprint
from flask import Flask, jsonify, request, abort
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from Controller.mysql_connector import get_db_connection


api_suppliers = Blueprint('api_suppliers', __name__)

# Configura a conexão com o banco de dados MySQL
db = get_db_connection()

# API SUPPLIERS #
# Define a rota GET para buscar dados do banco de dados
@api_suppliers.route('/suppliers', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados():
    current_supplier = get_jwt_identity()
    if not current_supplier:
        return abort(404)
    cursor = db.cursor()
    cursor.execute('SELECT * FROM fornecedores')
    resultados = cursor.fetchall()
    cursor.close()
    items = []
    for row in resultados:
        item = {
            "id": row[0],
            "nome": row[1],
            "contato": row[2],
            "detalhes_pagamento": row[3],
            "prazo_entrega": row[4],
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)

# Define a rota GET para buscar dados do banco de dados especifico
@api_suppliers.route('/suppliers/<int:id>', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_dados_user(id):
    current_supplier = get_jwt_identity()
    if not current_supplier:
        return abort(404)
    cursor = db.cursor()
    sql = 'SELECT * FROM fornecedores WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    result = cursor.fetchone()
    cursor.close()
    if result:
        return jsonify({'mensagem': 'Cliente localizado com sucesso!', 'cliente': result})
    else:
        return jsonify({'mensagem': 'Cliente não encontrado!'}), 404

# Define a rota POST para inserir dados no banco de dados
@api_suppliers.route('/suppliers/add', methods=['POST'])
@jwt_required()
def inserir_dados():
    current_supplier = get_jwt_identity()
    if not current_supplier:
        return abort(404)
    dados = request.json
    cursor = db.cursor()
    sql = 'INSERT INTO fornecedores (nome, contato, detalhes_pagamento, prazo_entrega) VALUES (%s, %s, %s, %s)'
    val = (dados['nome'], dados['contato'], dados['detalhes_pagamento'], dados['prazo_entrega'])
    cursor.execute(sql, val)
    db.commit()
    print(cursor)
    cursor.close()
    return jsonify({'mensagem': 'Dados inseridos com sucesso!'})

# Define a rota PUT para atualizar dados no banco de dados
@api_suppliers.route('/suppliers/update/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_dados(id):
    current_supplier = get_jwt_identity()
    if not current_supplier:
        return abort(404)
    dados = request.json
    cursor = db.cursor()
    sql = 'UPDATE fornecedores SET id = %s, nome = %s, contato = %s, detalhes_pagamento = %s, prazo_entrega = %s'
    val = (dados['id'], dados['nome'], dados['contato'], dados['detalhes_pagamento'], dados['prazo_entrega'], id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})

# Define a rota DELETE para excluir dados do banco de dados
@api_suppliers.route('/suppliers/delete/<int:id>', methods=['DELETE'])
@jwt_required() # Protege a rota com JWT
def excluir_dados(id):
    current_supplier = get_jwt_identity()
    if not current_supplier:
        return abort(404)
    cursor = db.cursor()
    sql = 'DELETE FROM fornecedores WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados excluídos com sucesso!'})

# Define a rota para obter o último ID de usuário
@api_suppliers.route('/suppliers/lastSupplierId', methods=['GET'])
@jwt_required()
def get_last_supplier_id():
    try:
        current_supplier = get_jwt_identity()
        if not current_supplier:
            return abort(404)
        cursor = db.cursor()
        cursor.execute('SELECT MAX(id) FROM fornecedores')
        last_user_id = cursor.fetchone()[0]
        cursor.close()
        response = jsonify(last_user_id)
        return response
    except Exception as e:
        return jsonify(error=str(e)), 500