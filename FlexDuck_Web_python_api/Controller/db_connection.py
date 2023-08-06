from Controller.mysql_utils import get_db_name_from_subdomain, db_pool
from mysql.connector import pooling, errors
from flask import request

# Configuração do pool de conexões do MySQL
db_config = {
    "host": "db-flexduck.cncrrju5nmty.sa-east-1.rds.amazonaws.com",
    "port": "3306",
    "user": "duckadmin",
    "password": "lavemopato",
}

def get_db_connection(subdomain):
    try:
        db_name = get_db_name_from_subdomain(subdomain)

        db_config = {
            "host": "db-flexduck.cncrrju5nmty.sa-east-1.rds.amazonaws.com",
            "port": "3306",
            "user": "duckadmin",
            "password": "lavemopato",
            "database": db_name,
        }

        db_pool = pooling.MySQLConnectionPool(pool_name="fleduckdb_pool", pool_size=5, **db_config)
        return db_pool.get_connection()
    except pooling.errors.PoolError as e:
        print("Erro ao obter conexão do pool: ", str(e))
        return None

# Função para reconectar ao banco de dados MySQL
def reconnect_db(conn):
    try:
        conn.ping(reconnect=True)
        print("Conexão estável com o banco de dados")
    except pooling.errors.OperationalError as e:
        print("Erro de conexão com o banco de dados. Tentando reconectar...")
        conn.reconnect()
        print("Reconexão bem-sucedida ao banco de dados")
