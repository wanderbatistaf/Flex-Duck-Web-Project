from Controller.mysql_utils import get_db_name_from_subdomain, db_pool
from mysql.connector import pooling, errors
from flask import request

def get_db_connection(subdomain):
    try:
        db_name = get_db_name_from_subdomain(subdomain)

        # O pool de conexões já foi criado em mysql_utils.py, basta utilizar db_pool aqui
        return db_pool.get_connection()
    except pooling.errors.PoolError as e:
        print("Erro ao obter conexão do pool: ", str(e))
        return None
