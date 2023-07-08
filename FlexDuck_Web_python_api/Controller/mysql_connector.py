from mysql.connector import pooling

# Configuração do pool de conexões do MySQL
db_config = {
    "host": "db4free.net",
    "port": "3306",
    "user": "flexduck",
    "password": "lavemopato",
    "database": "flexduckdb",
}

# Criação do pool de conexões
db_pool = pooling.MySQLConnectionPool(pool_name="fleduckdb_pool", pool_size=5, **db_config)

# Função para obter uma conexão do pool
def get_db_connection():
    return db_pool.get_connection()

# Função para reconectar ao banco de dados MySQL
def reconnect_db():
    try:
        conn = get_db_connection()
        conn.ping(reconnect=True)
        print("Conexão estável com o banco de dados")
        conn.close()
    except mysql_connector.OperationalError:
        print("Erro de conexão com o banco de dados. Tentando reconectar...")
        conn.reconnect()
        print("Reconexão bem-sucedida ao banco de dados")
