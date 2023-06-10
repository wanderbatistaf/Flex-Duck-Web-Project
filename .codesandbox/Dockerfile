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

# Execute o aplicativo com uWSGI
CMD ["uwsgi", "app.ini"]
