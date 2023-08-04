FROM python:3.10

WORKDIR /app

COPY . /app

RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["uwsgi", "--http", "0.0.0.0:5000", "--wsgi-file", "app.py", "--callable", "app", "--processes", "4", "--threads", "2", "--stats", "0.0.0.0:9191", "--py-autoreload", "1"]
