import mysql.connector

# Configura a conexão com o banco de dados MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="senha123",
    database="suprema_embutidos"
)