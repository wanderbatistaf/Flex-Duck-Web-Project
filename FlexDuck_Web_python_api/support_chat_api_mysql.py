from flask import Flask, request, render_template, redirect, url_for, session, Blueprint
from flask_socketio import SocketIO, join_room, leave_room, send
import smtplib
from email.mime.text import MIMEText

from Utils.chat_utils import generate_room_code

support_chat = Blueprint('support_chat', __name__)
socketio = SocketIO(support_chat)

SMTP_SERVER = "smtp.gmail.com"  # servidor SMTP apropriado
SMTP_PORT = 587  # porta do servidor SMTP apropriada
EMAIL_ADDRESS = "flexduckdev@gmail.com"  # endereço de e-mail
EMAIL_PASSWORD = "sgxv ffcl tmkg rhrq"  # senha de e-mail
RECIPIENT_EMAIL = "flexduckdev@gmail.com"  # e-mail do destinatário

def send_email(subject, message):
    try:
        # Conectando ao servidor SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)

        # Criando a mensagem de e-mail
        msg = MIMEText(message)
        msg["Subject"] = subject
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = RECIPIENT_EMAIL

        # Enviando o e-mail
        server.sendmail(EMAIL_ADDRESS, RECIPIENT_EMAIL, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail: {str(e)}")
        return False


rooms = {}

@support_chat.route('/client-home', methods=["GET", "POST"])
def clientHome():
    session.clear()

    if request.method == "POST":
        name = request.form.get('name')
        create = request.form.get('create', False)
        code = request.form.get('code')
        join = request.form.get('join', False)
        initial_message = request.form.get('initial-message')  # Adicione isso para obter a mensagem inicial

        if not name:
            return render_template('client-home.html', error="Name is required", code=code)

        if create != False:
            room_code = generate_room_code(6, list(rooms.keys()))
            new_room = {
                'members': 0,
                'messages': [{"sender": name, "message": initial_message}],  # Inclui a mensagem inicial aqui
            }
            rooms[room_code] = new_room

            # Envie o código da sala por e-mail
            recipient_email = 'flexduckdev@gmail.com'  # Endereço de e-mail do destinatário
            subject = 'Código da Sala Wand Chat'
            message = f'O código da sua nova sala é: {room_code}'
            if send_email(subject, message):
                print('E-mail enviado com sucesso!')
            else:
                print('Erro ao enviar o e-mail.')

        if join != False:
            # no code
            if not code:
                return render_template('client-home.html', error="Please enter a room code to enter a chat room", name=name)
            # invalid code
            if code not in rooms:
                return render_template('client-home.html', error="Room code invalid", name=name)

            room_code = code

        session['room'] = room_code
        session['name'] = name
        return redirect(url_for('room'))
    else:
        return render_template('client-home.html')



@support_chat.route('/agent-home', methods=["GET", "POST"])
def home():
    session.clear()

    if request.method == "POST":
        name = request.form.get('name')
        create = request.form.get('create', False)
        code = request.form.get('code')
        join = request.form.get('join', False)
        initial_message = request.form.get('initial-message')  # Adicione isso para obter a mensagem inicial

        if not name:
            return render_template('agent-home.html', error="Name is required", code=code)

        if create != False:
            room_code = generate_room_code(6, list(rooms.keys()))
            new_room = {
                'members': 0,
                'messages': [{"sender": name, "message": initial_message}],  # Inclui a mensagem inicial aqui
            }
            rooms[room_code] = new_room

        if join != False:
            # no code
            if not code:
                return render_template('agent-home.html', error="Please enter a room code to enter a chat room", name=name)
            # invalid code
            if code not in rooms:
                return render_template('agent-home.html', error="Room code invalid", name=name)

            room_code = code

        session['room'] = room_code
        session['name'] = name
        return redirect(url_for('room'))
    else:
        return render_template('agent-home.html')


@support_chat.route('/room')
def room():
    room = session.get('room')
    name = session.get('name')

    if name is None or room is None or room not in rooms:
        return redirect(url_for('client-home'))

    messages = rooms[room]['messages']
    return render_template('room.html', room=room, user=name, messages=messages)


@socketio.on('connect')
def handle_connect():
    name = session.get('name')
    room = session.get('room')

    if name is None or room is None:
        return
    if room not in rooms:
        leave_room(room)

    join_room(room)
    send({
        "sender": "",
        "message": f"{name} has entered the chat"
    }, to=room)
    rooms[room]["members"] += 1


@socketio.on('message')
def handle_message(payload):
    room = session.get('room')
    name = session.get('name')

    if room not in rooms:
        return

    message = {
        "sender": name,
        "message": payload["message"]
    }
    send(message, to=room)
    rooms[room]["messages"].append(message)


@socketio.on('disconnect')
def handle_disconnect():
    room = session.get("room")
    name = session.get("name")
    leave_room(room)

    if room in rooms:
        rooms[room]["members"] -= 1
        if rooms[room]["members"] <= 0:
            del rooms[room]

    send({
        "message": f"{name} has left the chat",
        "sender": ""
    }, to=room)
