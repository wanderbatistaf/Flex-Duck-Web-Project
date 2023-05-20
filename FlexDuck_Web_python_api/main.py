from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from Controller import mysql_connector

# Inicializa o aplicativo Flask
# app = Flask(__name__)
# CORS(app)  # Permite que o Flask responda a solicitações de qualquer origem
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['JWT_SECRET_KEY'] = '4Ndr3w5077' # Chave secreta do JWT
jwt = JWTManager(app)

# Configura a conexão com o banco de dados MySQL
db = mysql_connector.db

# Adiciona as rotas de usuários
from api_user_mysql import api_users
app.register_blueprint(api_users)

# Adiciona as rotas de clientes
from api_clients_mysql import  api_clients
app.register_blueprint(api_clients)

# Rota para autenticar e obter o token JWT
@app.route('/auth/login', methods=['POST'])
def autenticar_usuario():
    dados = request.json
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE username=%s AND password=%s", (dados['username'], dados['password']))
    user = cursor.fetchone()
    cursor.close()
    if user:
        token_data = {'username': user['username'], 'level': user['level'], 'user_id': user['user_id']}
        token = create_access_token(identity=token_data)
        print(token)
        return jsonify({'access_token': token})
    else:
        return jsonify({'mensagem': 'Usuário ou senha inválidos'}), 401

@app.route('/auth/user-level', methods=['GET'])
@jwt_required()
def get_user_level():
    identity = get_jwt_identity()
    level = identity.get('level', None)
    if level:
        return jsonify({'level': level}), 200
    else:
        return jsonify({'mensagem': 'Nível de acesso não encontrado'}), 404




# Executa o aplicativo Flask
if __name__ == '__main__':
    app.run(debug=True)
