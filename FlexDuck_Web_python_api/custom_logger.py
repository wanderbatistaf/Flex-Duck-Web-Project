import logging
from logging.handlers import RotatingFileHandler
from concurrent.futures import ThreadPoolExecutor

import logging
from logging.handlers import RotatingFileHandler
import sys


class CustomLogFormatter(logging.Formatter):
    def format(self, record):
        return f"[{record.asctime}|pid: {record.process}|app: {record.app_name}|req: {record.request_id}/{record.application}|{record.remote_addr}] {record.message}"


def setup_logger(app):
    handler = RotatingFileHandler('app.log', maxBytes=100000, backupCount=1)
    formatter = CustomLogFormatter()
    handler.setFormatter(formatter)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    app.logger.addHandler(handler)
    app.logger.addHandler(console_handler)  # Adicionar o manipulador para a saída padrão (console)

    app.logger.setLevel(logging.DEBUG)


def async_log(record):
    with ThreadPoolExecutor() as executor:
        future = executor.submit(logging.getLogger().handle, record)
        future.result()

