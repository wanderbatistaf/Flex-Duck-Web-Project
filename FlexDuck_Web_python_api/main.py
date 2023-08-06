import os
import sys
import subprocess
import threading
import time
from threading import Thread
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

import mysql.connector
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from custom_logger import setup_logger
from Controller.mysql_utils import AppContext
from Controller.db_connection import get_db_connection

# Cria a instância do contexto da aplicação
app_context = AppContext()

# Inicializa o aplicativo Flask
app = Flask(__name__)
# Configurar o logger personalizado
setup_logger(app)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['JWT_SECRET_KEY'] = '4Ndr3w5077'  # Chave secreta do JWT
jwt = JWTManager(app)


# Rota do servidor para receber o subdomínio
@app.route('/subdomain', methods=['GET'])
def get_subdomain():
    subdomain = request.headers.get('X-Subdomain')
    app_context.set_subdomain(subdomain)  # Define o subdomínio no contexto da aplicação
    return f'O subdomínio enviado é: {subdomain}'


# Variável para armazenar a referência à thread de verificação de conexão
check_db_thread = None

# Variável global para controlar a execução da thread
app_running = True


# Função para encerrar a conexão com o banco de dados
def fechar_conexao_db(exception=None):
    global db_pool
    db_pool.shutdown()


# Função para reconectar ao banco de dados MySQL
def reconnect_db(conn):
    try:
        conn.ping(reconnect=True)
        print("Conexão estável com o banco de dados")
    except mysql.connector.errors.OperationalError:
        print("Erro de conexão com o banco de dados. Tentando reconectar...")
        conn.reconnect()
        print("Reconexão bem-sucedida ao banco de dados")


# Classe para manipular eventos de alteração de arquivo
class FileModifiedEventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith('.py'):
            # Reinicia o aplicativo em um novo processo
            reiniciar_aplicativo()


# Adiciona as rotas de usuários
from api_user_mysql import api_users
app.register_blueprint(api_users)

# Adiciona as rotas de clientes
from api_clients_mysql import api_clients
app.register_blueprint(api_clients)

# Adiciona as rotas de fornecedores
from api_suppliers_mysql import api_suppliers
app.register_blueprint(api_suppliers)

# Adiciona as rotas de produtos
from api_products_mysql import api_products
app.register_blueprint(api_products)

# Adiciona as rotas de contabil
from api_contabil_mysql import api_contabilidade
app.register_blueprint(api_contabilidade)

# Adiciona as rotas de notas de entrada
from api_notas_entrada_mysql import api_notas_entrada
app.register_blueprint(api_notas_entrada)

# Adiciona as rotas de notas de saida
from api_notas_saida_mysql import api_notas_saida
app.register_blueprint(api_notas_saida)

# Adiciona as rotas de forma de pagamento
from api_forma_pagamento_mysql import api_forma_pagamento
app.register_blueprint(api_forma_pagamento)

# Adiciona as rotas das bandeiras de cartão
from api_bandeiras_card_mysql import api_bandeiras
app.register_blueprint(api_bandeiras)

# Adiciona as rotas de vendas
from api_vendas_mysql import api_vendas
app.register_blueprint(api_vendas)

# Adiciona as rotas de relatorios-pdf
from api_gerar_report import reports
app.register_blueprint(reports)


@app.route('/server/status/check-connection', methods=['GET'])
def check_connection():
    try:
        # Obtém o subdomínio a partir da requisição Flask
        subdomain = request.headers.get('X-Subdomain')

        # Obtém a conexão com o banco de dados usando o subdomínio como argumento
        conn = get_db_connection(subdomain)

        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if result:
            return jsonify({'status': 'ok'})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to fetch result'}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# Rota para autenticar e obter o token JWT
@app.route('/auth/login', methods=['POST'])
def autenticar_usuario():
    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')
    dados = request.json
    conn = get_db_connection(subdomain)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE username=%s AND password=%s", (dados['username'], dados['password']))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
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


# Variável global para controlar a execução da thread
app_running = True


# Função para verificar a conexão a cada 5 minutos
def check_db_connection(subdomain):  # Recebe o subdomínio como argumento
    conn = get_db_connection(subdomain)  # Passe o subdomínio como argumento
    if conn:
        try:
            reconnect_db(conn)
            conn.close()
        except Exception as e:
            print("Erro ao verificar a conexão com o banco de dados:", str(e))
            # Encerra o aplicativo Flask
            encerrar_aplicativo()
            # Reinicia o aplicativo em um novo processo
            reiniciar_aplicativo()


# Função para encerrar o aplicativo Flask
def encerrar_aplicativo():
    global check_db_thread
    print("Encerrando o aplicativo...")
    app_running = False  # Define a variável de controle como False para encerrar a thread de verificação de conexão
    if check_db_thread:
        check_db_thread.join()  # Aguarda a thread de verificação de conexão encerrar
    func = request.environ.get('werkzeug.server.shutdown')
    if func is not None:
        func()


# Função para reiniciar o aplicativo em um novo processo
def reiniciar_aplicativo():
    global check_db_thread
    print("Reiniciando o aplicativo...")
    if check_db_thread:
        check_db_thread.join()  # Aguarde a thread de verificação de conexão encerrar completamente
    subdomain = request.headers.get('X-Subdomain')  # Obtenha o subdomínio da requisição atual
    check_db_thread = threading.Thread(target=check_db_connection,
                                       kwargs={'subdomain': subdomain})  # Passe o subdomínio como argumento
    check_db_thread.start()
    subprocess.Popen([sys.executable] + sys.argv)
    sys.exit()


@app.route('/qrscan/<string:codigo>', methods=['GET'])
def buscar_dados_do_produto_qrscan(codigo):
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = 'SELECT codigo, nome, quantidade, preco_venda, descricao FROM produtos_servicos WHERE codigo = %s'
    val = (codigo,)
    cursor.execute(sql, val)
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    if result:
        return jsonify({'mensagem': 'Produto localizado com sucesso!', 'produto': result})
    else:
        return jsonify({'mensagem': 'Produto não encontrado!'}), 404


check_db_thread = threading.Thread(target=check_db_connection, kwargs={'subdomain': 'flexduckdb'})
check_db_thread.start()


# Obtém o caminho absoluto para o diretório atual onde main.py está sendo executado
current_dir = os.path.abspath(os.getcwd())

# Executa o aplicativo Flask
if __name__ == '__main__':
    observer = Observer()
    event_handler = FileModifiedEventHandler()
    dir_path = os.path.join(current_dir, '.')
    observer.schedule(event_handler, dir_path, recursive=True)
    observer.start()
    print(f"Monitorando alterações no diretório: {dir_path}")

    try:
        app.run(host='0.0.0.0', port=5000, threaded=True)
    finally:
        observer.stop()
        observer.join()
        app.teardown_appcontext(fechar_conexao_db)
