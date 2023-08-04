# Use a imagem base Python
FROM python:3.10

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie os arquivosdoc de código-fonte para o contêiner
COPY . /app

# Instale as dependências
RUN pip install -r requirements.txt

# Exponha a porta do aplicativo
EXPOSE 5000

# Adicione o comando para executar o aplicativo com uWSGI e o watchdog
CMD ["uwsgi", "--http", "0.0.0.0:5000", "--wsgi-file", "main.py", "--callable", "app", "--processes", "4", "--threads", "2", "--stats", "0.0.0.0:9191", "--py-autoreload", "1"]

