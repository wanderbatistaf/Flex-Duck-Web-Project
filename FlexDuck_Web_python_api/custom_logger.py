import logging
from logging.handlers import RotatingFileHandler

class CustomLogFormatter(logging.Formatter):
    def format(self, record):
        return f"[{record.asctime}|pid: {record.process}|app: {record.app_name}|req: {record.request_id}/{record.application}|{record.remote_addr}] {record.message}"

def setup_logger(app):
    handler = RotatingFileHandler('app.log', maxBytes=100000, backupCount=1)
    formatter = CustomLogFormatter()
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.DEBUG)
