import os
import sys
import subprocess
import threading
import time
import smtplib
import secrets
from uuid import uuid4

import mysql.connector

from datetime import timedelta
from threading import Thread
from flask import Flask, jsonify, request, session, redirect, url_for, render_template, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_socketio import SocketIO, join_room, leave_room, send

from email.mime.text import MIMEText

from Utils.chat_utils import generate_room_code

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from custom_logger import setup_logger
from Controller.mysql_utils import AppContext
from Controller.db_connection import get_db_connection
from Controller.mysql_utils import create_db_pool

# Cria a instância do contexto da aplicação
app_context = AppContext()

# Inicializa o aplicativo Flask
app = Flask(__name__)
# Configurar o logger personalizado
setup_logger(app)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['JWT_SECRET_KEY'] = '4Ndr3w5077'  # Chave secreta do JWT
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2) # Define o tempo de vida útil do token
app.secret_key = secrets.token_hex(16)  # Gera uma chave secreta de 16 bytes (128 bits)
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

# Adiciona as rotas de dados da empresa
from api_company_settings import api_company_settings
app.register_blueprint(api_company_settings)

# Adiciona as rotas de dados dos modulos
from api_modulos_mysql import api_modulos
app.register_blueprint(api_modulos)

# Adiciona as rotas de dados dos ceps
from api_cep import viacep
app.register_blueprint(viacep)

# Adiciona as rotas de dados das notificações
from api_notify_mysql import notifys_api
app.register_blueprint(notifys_api)

# Adiciona as rotas de dados das notificações
from api_servicos_mysql import api_servicos
app.register_blueprint(api_servicos)

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
    if request.method == 'OPTIONS':
        # Retorna uma resposta vazia com status 200 para pre-flight request
        return "", 200

    try:
        # Obtém o subdomínio a partir da requisição Flask
        subdomain = request.headers.get('X-Subdomain')

        # Obtém a conexão com o banco de dados usando o subdomínio como argumento
        conn = get_db_connection(subdomain)

        dados = request.json
        cursor = conn.cursor(dictionary=True)
        print("Executing query on database:", subdomain)
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

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500




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
    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')
    conn = get_db_connection(subdomain)
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

###################### SUPPORT CHAT ##################################
# CORS(app, resources={r"/*": {"origins": "*"}})
#
# socketio = SocketIO(app, cors_allowed_origins="*")
#
# SMTP_SERVER = "smtp.gmail.com"  # servidor SMTP apropriado
# SMTP_PORT = 587  # porta do servidor SMTP apropriada
# EMAIL_ADDRESS = "flexduckdev@gmail.com"  # endereço de e-mail
# EMAIL_PASSWORD = "sgxv ffcl tmkg rhrq"  # senha de e-mail
# RECIPIENT_EMAIL = "flexduckdev@gmail.com"  # e-mail do destinatário
#
# def send_email(subject, message):
#     try:
#         # Conectando ao servidor SMTP
#         server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
#         server.starttls()
#         server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
#
#         # Criando a mensagem de e-mail
#         msg = MIMEText(message)
#         msg["Subject"] = subject
#         msg["From"] = EMAIL_ADDRESS
#         msg["To"] = RECIPIENT_EMAIL
#
#         # Enviando o e-mail
#         server.sendmail(EMAIL_ADDRESS, RECIPIENT_EMAIL, msg.as_string())
#         server.quit()
#         return True
#     except Exception as e:
#         print(f"Erro ao enviar e-mail: {str(e)}")
#         return False

# @app.route('/client-home', methods=["GET","POST"])
# def client_home():
#     data = request.json
#
#     name = data.get('name')
#     create = data.get('create', False)
#     code = data.get('code')
#     join = data.get('join', False)
#     initial_message = data.get('initial_message')
#
#     if not name:
#         return jsonify({"error": "Name is required"})
#
#     # Obtenha o subdomínio a partir do cabeçalho da solicitação (X-Subdomain)
#     subdomain = request.headers.get('X-Subdomain')
#
#     if create:
#         # Verifique se já existe uma sala associada ao subdomínio
#         if subdomain in rooms:
#             return jsonify({"error": "A room already exists for this domain"})
#
#         room_code = generate_room_code(6, list(rooms.keys()))
#         new_room = {
#             'members': 0,
#             'messages': [{"sender": name, "message": initial_message}],
#         }
#         rooms[room_code] = new_room
#
#         # recipient_email = 'flexduckdev@gmail.com'
#         # subject = 'Solicitação de Suporte FlexDuck'
#         # message = f'O código da sala é: {room_code}'
#         # if send_email(subject, message):
#         #     print('E-mail enviado com sucesso!')
#         # else:
#         #     print('Erro ao enviar o e-mail.')
#
#         # Retorne o código da sala no JSON de resposta
#         response_data = {
#             "message": "Success",
#             "room": room_code,  # Inclua o código da sala na resposta
#             "name": name,
#         }
#         return jsonify(response_data)
#
#     if join:
#         if not code:
#             return jsonify({"error": "Please enter a room code to enter a chat room"})
#
#         if code not in rooms:
#             return jsonify({"error": "Room code invalid"})
#
#         room_code = code
#
#     session['room'] = room_code
#     session['name'] = name
#
#     response_data = {
#         "message": "Success",
#         "room": room_code,
#         "name": name,
#     }
#
#     return jsonify(response_data)
#
#
#
#
# @app.route('/agent-home', methods=["POST"])
# def agent_home():
#     data = request.json
#
#     name = data.get('name')
#     create = data.get('create', False)
#     code = data.get('code')
#     join = data.get('join', False)
#     initial_message = data.get('initial_message')
#
#     if not name:
#         return jsonify({"error": "Name is required"})
#
#     if create:
#         room_code = generate_room_code(6, list(rooms.keys()))
#         new_room = {
#             'members': 0,
#             'messages': [{"sender": name, "message": initial_message}],
#         }
#         rooms[room_code] = new_room
#
#     if join:
#         if not code:
#             return jsonify({"error": "Please enter a room code to enter a chat room"})
#
#         if code not in rooms:
#             return jsonify({"error": "Room code invalid"})
#
#         room_code = code
#
#     session['room'] = room_code
#     session['name'] = name
#
#     # Você pode retornar dados adicionais se necessário em JSON
#     response_data = {
#         "message": "Success",
#         "room": room_code,
#         "name": name,
#     }
#
#     return jsonify(response_data)
#
#
# @app.route('/room', methods=["GET"])
# def get_room():
#     room = session.get('room')
#     name = session.get('name')
#
#     if name is None or room is None or room not in rooms:
#         return jsonify({"error": "User not in a valid room"})
#
#     messages = rooms[room]['messages']
#
#     # Retornar os dados da sala e mensagens em JSON
#     response_data = {
#         "room": room,
#         "user": name,
#         "messages": messages,
#     }
#
#     return jsonify(response_data)
#
# @app.route('/disconnect', methods=['POST'])
# def disconnect():
#     try:
#         data = request.get_json()
#         sid = data.get('sid')  # Obtenha o 'sid' da solicitação POST
#         print("Received disconnect request:", data)
#
#         # Verifique se a sala associada ao 'sid' existe
#         for room, room_data in rooms.items():
#             if sid in room_data.get('clients', []):
#                 # Remova o 'sid' da lista de clientes da sala
#                 room_data['clients'].remove(sid)
#                 # Se não houver mais clientes na sala, remova a sala
#                 if not room_data['clients']:
#                     del rooms[room]
#                     # Defina room_closed como True para indicar que a sala está fechada
#                     room_data['room_closed'] = True
#                 return jsonify({"message": "Desconectado com sucesso"})
#
#         return jsonify({"error": "Cliente não encontrado"})
#     except Exception as e:
#         return jsonify({"error": str(e)})
#
#
#
#
# rooms = {}
# global_messages = {}
#
#
# @app.route('/send_or_check_messages/<room_code>', methods=['GET', 'POST', 'OPTIONS'])
# def send_or_check_messages(room_code):
#     global rooms
#     global global_messages
#
#     if request.method == 'OPTIONS':
#         response = make_response()
#         response.headers.add('Access-Control-Allow-Origin', '*')
#         response.headers.add('Access-Control-Allow-Headers', '*')
#         response.headers.add('Access-Control-Allow-Methods', '*')
#         return response
#
#     try:
#         if room_code not in rooms:
#             rooms[room_code] = {"messages": []}
#
#         if request.method == 'POST':
#             data = request.get_json()
#             name = data.get('sender')
#             message_text = data.get('message')
#
#             # Gere um UUID para a mensagem
#             message_id = str(uuid4())
#
#             message = {
#                 "sender": name,
#                 "message": message_text,
#                 "message_id": message_id,  # Inclua o identificador exclusivo da mensagem
#             }
#
#             rooms[room_code]["messages"].append(message)
#             global_messages[room_code] = rooms[room_code]["messages"]
#             print(f"Received message in room {room_code} from {name}: {message}")
#             print(global_messages)
#             return jsonify({"message": "Message sent successfully"})
#
#
#         elif request.method == 'GET':
#
#             last_known_message_id = request.args.get('last_known_message_id')
#
#             if last_known_message_id is None:
#                 print("Parâmetro 'last_known_message_id' não fornecido na solicitação GET.")
#                 return jsonify({"error": "Parâmetro 'last_known_message_id' não fornecido", "status": "error"})
#
#             print(f"GET request received for room {room_code}, last_known_message_id: {last_known_message_id}")
#             print(global_messages)
#
#             # Verifique se a sala está fechada
#             if room_code not in rooms:
#                 print(f"Room {room_code} not found")
#                 return jsonify({"error": "Sala não encontrada", "room_closed": True})
#
#             all_messages = rooms[room_code]["messages"]
#
#             new_messages = [message for message in all_messages
#                             if message.get("message_id") is not None and message.get("message_id") > last_known_message_id]
#
#             print(f"Returning {len(new_messages)} new messages for room {room_code}")
#             print(all_messages)
#             print(new_messages)
#
#             return jsonify({"messages": new_messages, "room_closed": False, "status": "success"})
#
#     except Exception as e:
#         print(f"Error: {str(e)}")
#         return jsonify({"error": str(e), "status": "error"})
#
#
# # @app.route('/send_message', methods=['POST'])
# # def send_message():
# #     try:
# #         global rooms
# #
# #         data = request.get_json()
# #         room = data.get('room')
# #         name = data.get('sender')
# #         message = data.get('message')
# #         time = data.get('time')
# #
# #         print(data)
# #
# #         if room not in rooms:
# #             rooms[room] = {"messages": []}
# #
# #         message = {
# #             "sender": name,
# #             "message": message,
# #             "time": time,
# #         }
# #
# #         send(message, to=room)
# #         rooms[room]["messages"].append(message)
# #         print(rooms[room]["messages"])
# #         print(f"Received message in room {room} from {name}: {message}")
# #
# #         return jsonify({"message": "Message sent successfully"})
# #     except Exception as e:
# #         return jsonify({"error": str(e), "status": "error"})
# #
# #
# # @app.route('/check_new_messages/<room_code>', methods=['GET', 'OPTIONS'])
# # def check_new_messages(room_code):
# #     try:
# #         global rooms
# #
# #         if request.method == 'OPTIONS':
# #             response = make_response()
# #             response.headers.add('Access-Control-Allow-Origin', '*')
# #             response.headers.add('Access-Control-Allow-Headers', '*')
# #             response.headers.add('Access-Control-Allow-Methods', '*')
# #             return response
# #         elif request.method == 'GET':
# #             # Verifique se a sala está fechada
# #             if room_code not in rooms:
# #                 return jsonify({"error": "Sala não encontrada", "room_closed": True})
# #
# #             all_messages = rooms[room_code]["messages"]
# #
# #             print(rooms)
# #
# #             print(all_messages)
# #
# #             return jsonify({"messages": all_messages, "room_closed": False, "status": "success"})
# #     except Exception as e:
# #         return jsonify({"error": str(e), "status": "error"})
#
#
# @app.route('/close_all_rooms', methods=['POST'])
# def close_all_rooms():
#     try:
#         global rooms
#
#         # Percorra todas as salas e as feche
#         for room_code in list(rooms.keys()):
#             del rooms[room_code]
#
#         return jsonify({"message": "Todas as salas foram fechadas com sucesso"})
#     except Exception as e:
#         return jsonify({"error": str(e)})
#
#
#
#
# @socketio.on('connect')
# def handle_connect():
#     name = session.get('name')
#     room = session.get('room')
#
#     if name is None or room is None:
#         return
#     if room not in rooms:
#         leave_room(room)
#
#     join_room(room)
#     send({
#         "sender": "",
#         "message": f"{name} has entered the chat"
#     }, to=room)
#     rooms[room]["members"] += 1
#
#
# @socketio.on('message')
# def handle_message(payload):
#     room = session.get('room')
#     name = session.get('name')
#
#     if room not in rooms:
#         return
#
#     message = {
#         "sender": name,
#         "message": payload["message"]
#     }
#     send(message, to=room)
#     rooms[room]["messages"].append(message)
#
#
# @socketio.on('disconnect')
# def handle_disconnect():
#     room = session.get("room")
#     name = session.get("name")
#     leave_room(room)
#
#     if room in rooms:
#         rooms[room]["members"] -= 1
#         if rooms[room]["members"] <= 0:
#             del rooms[room]
#
#     send({
#         "message": f"{name} has left the chat",
#         "sender": ""
#     }, to=room)

############################ INIT MAIN ############################

# Executa o aplicativo Flask (apenas Flask)
if __name__ == '__main__':
    observer = Observer()
    event_handler = FileModifiedEventHandler()
    dir_path = os.path.join(current_dir, '.')
    observer.schedule(event_handler, dir_path, recursive=True)
    observer.start()
    print(f"Monitorando alterações no diretório: {dir_path}")

    try:
        # Inicie o aplicativo Flask em uma thread separada
        # flask_thread = threading.Thread(target=app.run, kwargs={'host': '0.0.0.0', 'port': 5000, 'threaded': True})
        # flask_thread.start()

        app.run(host='0.0.0.0', port=5000, threaded=True)

        # Inicie o SocketIO no mesmo processo Flask
        # socketio.run(app, host='0.0.0.0', port=5005, allow_unsafe_werkzeug=True)
    finally:
        observer.stop()
        observer.join()
        app.teardown_appcontext(fechar_conexao_db)


