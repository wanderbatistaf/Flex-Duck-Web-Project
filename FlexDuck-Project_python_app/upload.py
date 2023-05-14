import csv

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from platform import node
import getmac

cliente = (getmac.get_mac_address())

n_sheetName = cliente  # Please set sheet name you want to put the CSV data.
csvFile = 'mssmp3'  # Please set the filename and path of csv file.
trial = ['=E2+30']

scope = ["https://spreadsheets.google.com/feeds", 'https://www.googleapis.com/auth/spreadsheets',
         "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]

credentials = ServiceAccountCredentials.from_json_keyfile_name('client_secret.json', scope)
client = gspread.authorize(credentials)

spreadsheet = client.open('License')


__all__ = ["Upload_License"]


class Upload_License(object):
    def __init__(self, *args):
        ...

    def import_license(self, *args):
        cliente = (getmac.get_mac_address())

        n_sheetName = cliente  # Please set sheet name you want to put the CSV data.
        csvFile = 'mssmp3'  # Please set the filename and path of csv file.
        trial = ['=E2+30']

        scope = ["https://spreadsheets.google.com/feeds", 'https://www.googleapis.com/auth/spreadsheets',
                 "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]

        credentials = ServiceAccountCredentials.from_json_keyfile_name('client_secret.json', scope)
        client = gspread.authorize(credentials)

        spreadsheet = client.open('License')

        for sheet in spreadsheet:
            a = (['{}'.format(sheet.title)])
            sheetName = str(a).replace("[", "").replace("]", "").replace("'", "")

        if cliente in sheetName:
            print("Licença do cliente já cadastrada.")
        else:
            worksheet = spreadsheet.add_worksheet(
                title=f"{cliente}", rows="2", cols="6")
            spreadsheet.values_update(
                n_sheetName,
                params={'valueInputOption': 'USER_ENTERED'},
                body={'values': list(csv.reader(open(csvFile)))}
            )

            spreadsheet.values_update(
                f'{n_sheetName}''!F2',
                params={'valueInputOption': 'USER_ENTERED'},
                body={'values': [trial]}
            )
            print('Licença Exportada!')



if __name__ == "__main__":
    """ Importa licença ao abrir o programa """
    Upload_License()