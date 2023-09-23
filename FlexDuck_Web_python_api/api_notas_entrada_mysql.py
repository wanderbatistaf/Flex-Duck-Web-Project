import json
import logging
import time
from datetime import datetime

import mysql.connector
import decimal

from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

from Controller.db_connection import get_db_connection

api_notas_entrada = Blueprint('api_notas_entrada', __name__)


# API NOTAS ENTRADA #
# Define a rota GET para buscar dados das notas de entrada
@api_notas_entrada.route('/notas-entrada', methods=['GET'])
@jwt_required() # Protege a rota com JWT
def buscar_notas_entrada():
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
            cursor.execute('SELECT * FROM notas_entrada')
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
            'chaveAcesso': row[1],
            'numeroNF': row[2],
            'cUF': float(row[3]),
            'serie': row[4],
            'nomeEmitente': row[5],
            'cnpjEmitente': row[6],
            'enderecoEmitente': row[7],
            'nomeDestinatario': row[8],
            'cnpjDestinatario': row[9],
            'enderecoDestinatario': row[10],
            'modoFrete': row[11],
            'quantidadeVolumes': row[12],
            'especificacaoVolumes': row[13],
            'produtos': json.loads(row[14]),
            'informacoesAdicionais': row[15],
            'total': float(row[16]),
            'valorImpostos': float(row[17]),
            'impostosDetalhados': row[18],
            'dataEmissao': row[19]
        }
        items.append(item)
    response = {
        "totalPage": 1,
        "items": items
    }
    return jsonify(response)

# Define a rota POST para inserir dados de notas de entrada no banco de dados
@api_notas_entrada.route('/notas-entrada/add', methods=['POST'])
@jwt_required()
def inserir_notas_entrada():
    current_user = get_jwt_identity()
    if not current_user:
        return jsonify({'mensagem': 'Usuário não autenticado'}), 401

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    dados = request.json['extractedData']
    itens = request.json['itensInseridos']

    print('Dados da solicitação:', dados)

    try:
        # Conecta ao banco de dados
        db = get_db_connection(subdomain)
        cursor = db.cursor()

        destinatarioCNPJ = dados.get('destinatarioCNPJ', dados.get('destinatarioCPF', None))
        qVol = dados.get('qVol', None)
        chNFe = dados.get('chNFe')
        esp = dados.get('esp', None)


        # Insere os dados da nota de entrada na tabela notas_entrada
        sql_nota = '''
            INSERT INTO notas_entrada (chaveAcesso, numeroNF, cUF, serie, nomeEmitente, cnpjEmitente, enderecoEmitente,
            nomeDestinatario, cnpjDestinatario, enderecoDestinatario, modoFrete, quantidadeVolumes, especificacaoVolumes,
            produtos, informacoesAdicionais, total, valorImpostos, impostosDetalhados, dataEmissao)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        '''
        val_nota = (
            chNFe, dados['cNF'], dados['cUF'], dados['serie'], dados['emitenteNome'],
            dados['emitenteCNPJ'], dados['emitenteEndereco'], dados['destinatarioNome'],
            destinatarioCNPJ, dados['destinatarioEndereco'], dados['modFrete'], qVol, esp,
            json.dumps(dados['produtos']), dados['infAdic'], dados['totalValorNF'], dados['valorImpostos'],
            dados['impostosDetalhados'], dados['dataEmissao']
        )
        cursor.execute(sql_nota, val_nota)
        nota_id = cursor.lastrowid

        # Insere os produtos da nota de entrada na tabela produtos_servicos
        for produto in itens:
            vUnCom = '{:.2f}'.format(float(produto['vUnCom'])).rstrip('0').rstrip('.')
            qCom = str(int(float(produto['qCom'])))
            current_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            print(produto)

            # Verifica se o item já existe no banco de dados
            sql_check_produto = "SELECT id, quantidade FROM produtos_servicos WHERE codigo = %s"
            cursor.execute(sql_check_produto, (produto['cProd'],))
            existing_product = cursor.fetchone()

            if existing_product:
                # O item já existe, portanto, atualize os campos necessários
                sql_update_produto = '''
                    UPDATE produtos_servicos
                    SET quantidade = quantidade + %s, preco_custo = %s, preco_venda = %s, nome = %s
                    WHERE id = %s
                '''
                val_update_produto = (qCom, vUnCom, produto['preco_venda'], produto['xProd'], existing_product['id'])
                cursor.execute(sql_update_produto, val_update_produto)
            else:
                # O item não existe, então insira-o
                sql_insert_produto = '''
                    INSERT INTO produtos_servicos (codigo, descricao, nome, categoria, preco_venda, quantidade,
                     preco_custo, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                '''
                val_insert_produto = (
                    produto['cProd'], produto['xProd'], produto['xProd'], produto['category_suggested'],
                    produto['preco_venda'], qCom, vUnCom, current_datetime
                )
                cursor.execute(sql_insert_produto, val_insert_produto)

        # Confirma a inserção e fecha a conexão
        db.commit()
        cursor.close()
        db.close()

        return jsonify({'mensagem': 'Dados de notas de entrada inseridos com sucesso!'}), 201
    except Exception as e:
        logging.error('Erro no servidor: %s', str(e))
        return jsonify({'erro': str(e)}), 500





# Define a rota PUT para atualizar dados das notas de entrada no banco de dados
@api_notas_entrada.route('/notas-entrada/update/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_notas_entrada(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    dados = request.json
    print(dados)
    cursor = db.cursor()
    sql = 'UPDATE notas_entrada SET contabilidade_id = %s, data = %s, valor = %s, descricao = %s, natureza_op = %s, nf_fatura = %s, serie = %s WHERE id = %s'
    val = (dados['contabilidade_id'], dados['data'], dados['valor'], dados['descricao'], dados['natureza_op'], dados['nf_fatura'], dados['serie'], id)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados de notas de entrada atualizados com sucesso!'})

# Define a rota DELETE para excluir dados das notas de entrada do banco de dados
@api_notas_entrada.route('/notas-entrada/delete/<int:id>', methods=['DELETE'])
@jwt_required() # Protege a rota com JWT
def excluir_notas_entrada(id):
    current_user = get_jwt_identity()
    if not current_user:
        return abort(404)

    # Obtém o subdomínio a partir da requisição Flask
    subdomain = request.headers.get('X-Subdomain')

    # Configura a conexão com o banco de dados MySQL
    db = get_db_connection(subdomain)
    cursor = db.cursor()
    sql = 'DELETE FROM notas_entrada WHERE id = %s'
    val = (id,)
    cursor.execute(sql, val)
    db.commit()
    cursor.close()
    return jsonify({'mensagem': 'Dados de notas de entrada excluídos com sucesso!'})
