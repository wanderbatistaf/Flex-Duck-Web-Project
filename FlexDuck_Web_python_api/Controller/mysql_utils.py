from mysql.connector import pooling, errors

class AppContext:
    def __init__(self):
        self.subdomain = None

    def set_subdomain(self, subdomain):
        self.subdomain = subdomain

    def get_subdomain(self):
        return self.subdomain


# Função para mapear o subdomínio ao nome do banco de dados
def get_db_name_from_subdomain(subdomain):
    if subdomain == "smarttech.flexduck.com.br":
        return "smarttechdb"
    elif subdomain == "www.flexduck.com.br":
        return "flexduckdb"
    elif subdomain == "localhost:4200":
        return "localtestdb"
    else:
        # Subdomínio desconhecido, retorne um valor padrão ou trate o erro
        return "localtestdb"

# Configuração do pool de conexões do MySQL
#def create_db_config(subdomain):
#    db_config = {
#        "host": "db-flexduck.cncrrju5nmty.sa-east-1.rds.amazonaws.com",
#        "port": "3306",
#        "user": "duckadmin",
#        "password": "lavemopato",
#        "database": get_db_name_from_subdomain(subdomain),
#    }
#    return db_config

def create_db_config(subdomain):
    db_config = {
        "host": "localhost",
        "port": "3306",
        "user": "root",
        "password": "senha123",
        "database": get_db_name_from_subdomain(subdomain),
    }
    return db_config


# Criação do pool de conexões
def create_db_pool(subdomain):
    db_config = create_db_config(subdomain)
    return pooling.MySQLConnectionPool(pool_name="flexduckdb_pool", pool_size=10, **db_config)


def get_db_connection(subdomain):
    return create_db_pool(subdomain).get_connection()


# Função para reconectar ao banco de dados MySQL
def reconnect_db(conn):
    try:
        conn.ping(reconnect=True)
        print("Conexão estável com o banco de dados")
    except pooling.errors.OperationalError as e:
        print("Erro de conexão com o banco de dados. Tentando reconectar...")
        conn.reconnect()
        print("Reconexão bem-sucedida ao banco de dados")
