FROM ubuntu:latest
LABEL authors="wandfreitasn"

# Instalar dependências
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip

# Copiar os arquivos do aplicativo para o contêiner
COPY . /app
WORKDIR /app

# Instalar as dependências do Python
RUN pip3 install -r requirements.txt

# Definir o comando de entrada para executar o aplicativo
CMD ["python3", "main.py"]
