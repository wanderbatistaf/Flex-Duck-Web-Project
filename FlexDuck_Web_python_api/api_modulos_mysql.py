import time

from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import mysql.connector

from Controller.db_connection import get_db_connection

api_modulos = Blueprint('api_modulos', __name__)



# Retornar o status atual do módulo de mesas (ligado ou desligado)
@api_modulos.route('/modules', methods=['GET'])
@jwt_required()
def obter_status_todos_modulos():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()

    # Obtém o status de todos os módulos da tabela modulos
    sql = 'SELECT * FROM modulos'
    cursor.execute(sql)
    modulos = cursor.fetchall()

    cursor.close()

    # Constrói o JSON de resposta com conversão de status para "true" ou "false"
    status_modulos = []
    for modulo in modulos:
        status = 'true' if modulo[2] == '1' else 'false'  # Converter para string
        status_modulos.append({
            'id': modulo[0],
            'modulo': modulo[1],
            'status': status
        })

    return jsonify({'modulos': status_modulos})




@api_modulos.route('/modules/mesas', methods=['GET'])
@jwt_required()
def obter_status_modulo_mesas():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()

    # Obtém o status do módulo "Mesas" da tabela modulos
    sql = 'SELECT * FROM modulos WHERE modulo = "Mesas"'
    cursor.execute(sql)
    modulo_mesas = cursor.fetchone()

    cursor.close()

    if modulo_mesas:
        status_modulo_mesas = {
            'id': modulo_mesas[0],
            'modulo': modulo_mesas[1],
            'status': modulo_mesas[2]
        }
        return jsonify(status_modulo_mesas)
    else:
        return abort(404)


# Modulo de Varejo
@api_modulos.route('/modules/varejo/toggle', methods=['PUT'])
@jwt_required()
def alternar_status_modulo_varejo():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()

    # Obtém o status atual do módulo "Mesas" da tabela modulos
    sql = 'SELECT * FROM modulos WHERE modulo = "Varejo"'
    cursor.execute(sql)
    modulo_varejo = cursor.fetchone()
    print(modulo_varejo)

    if modulo_varejo:
        # Converte o valor do status para int e inverte
        novo_status = not bool(int(modulo_varejo[2]))

        # Atualiza o status do módulo "Mesas" na tabela modulos
        sql = 'UPDATE modulos SET status = %s WHERE id = %s'
        cursor.execute(sql, (int(novo_status), modulo_varejo[0]))
        db.commit()

        cursor.close()

        # Converte o valor do status para string ('true' ou 'false')
        status_convertido = "true" if novo_status else "false"

        status_modulo_varejo = {
            'id': modulo_varejo[0],
            'modulo': modulo_varejo[1],
            'status': status_convertido
        }

        print(status_modulo_varejo)
        return jsonify(status_modulo_varejo)
    else:
        return abort(404)


# Modulo de Mesas
@api_modulos.route('/modules/mesas/toggle', methods=['PUT'])
@jwt_required()
def alternar_status_modulo_mesas():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()

    # Obtém o status atual do módulo "Mesas" da tabela modulos
    sql = 'SELECT * FROM modulos WHERE modulo = "Mesas"'
    cursor.execute(sql)
    modulo_mesas = cursor.fetchone()
    print(modulo_mesas)

    if modulo_mesas:
        # Converte o valor do status para int e inverte
        novo_status = not bool(int(modulo_mesas[2]))

        # Atualiza o status do módulo "Mesas" na tabela modulos
        sql = 'UPDATE modulos SET status = %s WHERE id = %s'
        cursor.execute(sql, (int(novo_status), modulo_mesas[0]))
        db.commit()

        cursor.close()

        # Converte o valor do status para string ('true' ou 'false')
        status_convertido = "true" if novo_status else "false"

        status_modulo_mesas = {
            'id': modulo_mesas[0],
            'modulo': modulo_mesas[1],
            'status': status_convertido
        }

        print(status_modulo_mesas)
        return jsonify(status_modulo_mesas)
    else:
        return abort(404)

# Modulo de Varejo
@api_modulos.route('/modules/servicos/toggle', methods=['PUT'])
@jwt_required()
def alternar_status_modulo_servicos():
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()

    # Obtém o status atual do módulo "Mesas" da tabela modulos
    sql = 'SELECT * FROM modulos WHERE modulo = "Servicos"'
    cursor.execute(sql)
    modulo_servicos = cursor.fetchone()
    print(modulo_servicos)

    if modulo_servicos:
        # Converte o valor do status para int e inverte
        novo_status = not bool(int(modulo_servicos[2]))

        # Atualiza o status do módulo "Mesas" na tabela modulos
        sql = 'UPDATE modulos SET status = %s WHERE id = %s'
        cursor.execute(sql, (int(novo_status), modulo_servicos[0]))
        db.commit()

        cursor.close()

        # Converte o valor do status para string ('true' ou 'false')
        status_convertido = "true" if novo_status else "false"

        status_modulo_servicos = {
            'id': modulo_servicos[0],
            'modulo': modulo_servicos[1],
            'status': status_convertido
        }

        print(status_modulo_servicos)
        return jsonify(status_modulo_servicos)
    else:
        return abort(404)


