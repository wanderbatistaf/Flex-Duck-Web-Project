from mysql.connector import pooling


# Configuração do pool de conexões do MySQL
db_config = {
    "host": "db-flexduck.cncrrju5nmty.sa-east-1.rds.amazonaws.com",
    "port": "3306",
    "user": "duckadmin",
    "password": "lavemopato",
    "database": "flexduckdb",

    # "host": "db4free.net",
    # "port": "3306",
    # "user": "flexduck",
    # "password": "lavemopato",
    # "database": "flexduckdb",
}

# Criação do pool de conexões
db_pool = pooling.MySQLConnectionPool(pool_name="fleduckdb_pool", pool_size=5, **db_config)

# Função para obter uma conexão do pool
def get_db_connection():
    try:
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
