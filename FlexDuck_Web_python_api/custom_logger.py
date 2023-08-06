import logging
import os
from logging.handlers import RotatingFileHandler
from flask import request

from Controller.mysql_utils import get_db_name_from_subdomain


def setup_logger(app):
    handler = RotatingFileHandler('app.log', maxBytes=100000, backupCount=1)
    formatter = logging.Formatter('[%(asctime)s|pid: %(process)d|%(remote_addr)s] %(message)s')
    handler.setFormatter(formatter)

    def log_request(environ=None, start_response=None):
        subdomain = request.headers.get('X-Subdomain')
        remote_addr = request.environ.get("REMOTE_ADDR", "-")
        request_id = request.environ.get("FLASK_REQUEST_ID", "-")

        extra = {'remote_addr': remote_addr}
        if request_id != "-":
            extra['request_id'] = request_id

        if subdomain:
            database_name = get_db_name_from_subdomain(subdomain)
            extra['database'] = database_name

        app.logger.info(
            f"[pid: {os.getpid()}|{remote_addr}|{extra.get('database', '-')}] Request: {request.method} {request.url} from {remote_addr} at {request.host}",
            extra=extra
        )

    app.before_request(log_request)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)




