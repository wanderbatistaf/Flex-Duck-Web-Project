#!/bin/bash

# Iniciar o Nginx
service nginx start

# Iniciar o Gunicorn (substitua os detalhes do comando conforme necessário)
gunicorn main:app --bind 0.0.0.0:5000 --workers 2 --threads 20 --certfile ./certified_ssl/fullchain.pem --keyfile ./certified_ssl/privkey.pem --log-level info &

# Obter o certificado Let's Encrypt usando o método --webroot
certbot certonly --webroot -w /var/www/html/.well-known/acme-challenge -d flexapiduck.flexduck.com.br --non-interactive --agree-tos -m flexduckdev@gmail.com

# Manter o contêiner em execução
tail -f /dev/null
