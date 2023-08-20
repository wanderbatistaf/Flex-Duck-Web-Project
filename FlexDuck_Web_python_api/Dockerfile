# Use a imagem base Python
FROM python:3.10

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie os arquivos de código-fonte para o contêiner
COPY . /app

# Instale as dependências
RUN pip install -r requirements.txt

# Instalação do Nginx e Certbot
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get install -y certbot python3-certbot-nginx && \
    apt-get clean

# Copia a configuração do Nginx para o contêiner
COPY nginx.conf /etc/nginx/sites-available/default

# Copiar o script start.sh para o contêiner
COPY start.sh /app/start.sh

# Conceder permissão de execução ao script
RUN chmod +x /app/start.sh

# Expor a porta do aplicativo
EXPOSE 80
EXPOSE 443

# Configurar o comando de entrada para executar o script start.sh
CMD ["/app/start.sh"]
