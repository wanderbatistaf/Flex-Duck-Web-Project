#!/bin/bash

# Iniciar o Nginx
service nginx start

# Iniciar o Gunicorn (substitua os detalhes do comando conforme necessário)
gunicorn main:app --bind 0.0.0.0:5000 --workers 2 --threads 20 --log-level debug &

# Obter o certificado Let's Encrypt
certbot --nginx --non-interactive --agree-tos -m flexduckdev@gmail.com -d flexduckapi.servehttp.com

# Manter o contêiner em execução
tail -f /dev/null