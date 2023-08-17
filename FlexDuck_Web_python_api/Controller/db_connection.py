from FlexDuck_Web_python_api.Controller.mysql_utils import create_db_pool


def get_db_connection(subdomain):
    return create_db_pool(subdomain).get_connection()
