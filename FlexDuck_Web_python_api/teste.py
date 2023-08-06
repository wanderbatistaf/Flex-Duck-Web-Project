import mysql.connector

from flask import Flask, jsonify, request, abort
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from Controller import mysql_utils

# Inicializa o aplicativo Flask
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = '4Ndr3w5077' # Chave secreta do JWT
jwt = JWTManager(app)

# Configura a conexão com o banco de dados MySQL
db = mysql_connector.db

# Adiciona as rotas de usuários
from api_user_mysql import api_users
app.register_blueprint(api_users)

# Rota para autenticar e obter o token JWT
@app.route('/login', methods=['POST'])
def autenticar_usuario():
    dados = request.json
    if dados['usuario'] == 'admin' and dados['senha'] == 'admin123':
        token = create_access_token(identity=dados['usuario'])
        return jsonify({'token': token})
    else:
        return jsonify({'mensagem': 'Usuário ou senha inválidos'}), 401


# API CLIENTS #
# Define a rota GET para buscar dados do banco de dados
@app.route('/clients', methods=['GET'])
# @jwt_required() # Protege a rota com JWT
def buscar_dados_client():
    # current_user = get_jwt_identity()
    # if not current_user:
    #     return abort(404)
    cursor = db.cursor()
    cursor.execute('SELECT * FROM clients')
    resultados = cursor.fetchall()
    cursor.close()
    print(resultados)
    return jsonify(resultados)


#Define a rota POST para inserir dados no banco de dados
@app.route('/clients', methods=['POST'])
#@jwt_required # Protege a rota com JWT
#Eu confio em você, voa beija-flor, eu confio em você -Saile
def inserir_dados_client():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    cursor = db.cursor()
    sql = 'INSERT INTO clients (campo1, campo2) VALUES (%s, %s)'
    val = (dados['campo1'], dados['campo2'])
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados inseridos com sucesso!'})

# Define a rota PUT para atualizar dados no banco de dados
@app.route('/clients/<int:id>', methods=['PUT'])
#@jwt_required # Protege a rota com JWT
def atualizar_dados_client(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    dados = request.json
    cursor = db.cursor()
    sql = 'UPDATE clients SET campo1 = %s, campo2 = %s WHERE id = %s'
    val = (dados['campo1'], dados['campo2'], id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados atualizados com sucesso!'})

# Define a rota DELETE para excluir dados do banco de dados
@app.route('/clients/<int:id>', methods=['DELETE'])
#@jwt_required # Protege a rota com JWT
def excluir_dados_client(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)
    cursor = db.cursor()
    sql = 'DELETE FROM clients WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados excluídos com sucesso!'})



print(app.url_map)

# Executa o aplicativo Flask
if __name__ == '__main__':
    app.run(debug=True)


