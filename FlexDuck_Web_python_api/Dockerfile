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

# Configurar o comando de entrada para executar o aplicativo com Gunicorn e Watchdog
CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "20", "--log-level", "debug"]


