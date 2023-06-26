import mysql.connector

# Configura a conexão com o banco de dados MySQL
db = mysql.connector.connect(
    host="db4free.net",
    port="3306",
    user="flexduck",
    password="lavemopato",
    database="flexduckdb"
)