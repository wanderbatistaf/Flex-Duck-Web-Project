import sys
import subprocess
import time
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from Controller import mysql_connector

# Inicializa o aplicativo Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['JWT_SECRET_KEY'] = '4Ndr3w5077' # Chave secreta do JWT
jwt = JWTManager(app)

# Função para reconectar ao banco de dados MySQL
def reconnect_db():
    try:
        db.ping(reconnect=True)
        print("Conexão estavel com o banco de dados")
    except mysql_connector.errors.OperationalError:
        print("Erro de conexão com o banco de dados. Tentando reconectar...")
        db.reconnect()
        print("Reconexão bem-sucedida ao banco de dados")

# Configura a conexão com o banco de dados MySQL
db = mysql_connector.db

# Adiciona as rotas de usuários
from api_user_mysql import api_users
app.register_blueprint(api_users)

# Adiciona as rotas de clientes
from api_clients_mysql import  api_clients
app.register_blueprint(api_clients)

# Adiciona as rotas de fornecedores
from api_suppliers_mysql import api_suppliers
app.register_blueprint(api_suppliers)

# Adiciona as rotas de produtos
from api_products_mysql import api_products
app.register_blueprint(api_products)

@app.route('/server/status/check-connection', methods=['GET'])
def check_connection():
    try:
        cursor = db.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        if result:
            return jsonify({'status': 'ok'})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to fetch result'}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# Rota para autenticar e obter o token JWT
@app.route('/auth/login', methods=['POST'])
def autenticar_usuario():
    dados = request.json
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE username=%s AND password=%s", (dados['username'], dados['password']))
    user = cursor.fetchone()
    cursor.close()
    if user:
        token_data = {
            'username': user['username'],
            'level': user['level'],
            'user_id': user['user_id'],
            'name': user['name'],
            'active': user['active']
        }
        token = create_access_token(identity=token_data)
        print(token)
        return jsonify({'access_token': token})
    else:
        # Tentar novamente até conectar
        while True:
            try:
                # Encerra o aplicativo Flask
                encerrar_aplicativo()
                # Reinicia o aplicativo em um novo processo
                reiniciar_aplicativo()
            except Exception as e:
                print("Erro ao tentar novamente:", str(e))
                time.sleep(3)  # Aguarda 3 segundos antes de tentar novamente


@app.route('/auth/user-level', methods=['GET'])
@jwt_required()
def get_user_level():
    identity = get_jwt_identity()
    level = identity.get('level', None)
    if level:
        return jsonify({'level': level}), 200
    else:
        return jsonify({'mensagem': 'Nível de acesso não encontrado'}), 404

# Função para verificar a conexão a cada 5 minutos
def check_db_connection():
    while True:
        try:
            reconnect_db()
        except Exception as e:
            print("Erro ao verificar a conexão com o banco de dados:", str(e))
            # Encerra o aplicativo Flask
            encerrar_aplicativo()
            # Reinicia o aplicativo em um novo processo
            reiniciar_aplicativo()
        time.sleep(50)  # Aguarda 50 segundos

# Função para encerrar o aplicativo Flask
def encerrar_aplicativo():
    print("Encerrando o aplicativo...")
    func = request.environ.get('werkzeug.server.shutdown')
    if func is not None:
        func()

# Função para reiniciar o aplicativo em um novo processo
def reiniciar_aplicativo():
    print("Reiniciando o aplicativo...")
    subprocess.Popen([sys.executable] + sys.argv)
    sys.exit()

# Thread para executar a função de verificação de conexão
check_db_thread = threading.Thread(target=check_db_connection)
check_db_thread.start()

# Executa o aplicativo Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
