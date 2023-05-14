import datetime
import os
import platform
import uuid


so = platform.system()
current_date = datetime.date.today()

__all__ = ["InfostClientes"]

class InfostClientes(object):
    def __init__(self, *args):
        ...

    def infosclients(self, *args):
        arquivo = 'mssmp3'
        filename = 'mssmp3'
        if os.path.isfile(arquivo):
            print(f'O caminho {arquivo} existe'.format(arquivo))
            pass
        else:
            mydata = (("Sistema Operacional:"),
                      (",Maquina:"),
                      (",Rede:"),
                      (",Plataforma:"),
                      (",Primeiro Uso:"),
                      (",Acess Limit:"),
                      (",MacAdress:,"),
                      (so),
                      (","+platform.machine()),
                      (","+platform.platform()),
                      (","+platform.node()),
                      (","+str(current_date)),
                      (",")+(':'.join(['{:02x}'.format((uuid.getnode() >> ele) & 0xff)
                for ele in range(0, 8 * 6, 8)][::-1])))
            print(mydata)
            with open(filename, 'w', newline='') as out:
                for row in mydata:
                    out.write(row)
                    print(row)
                    if platform.system() == "Windows":
                        pass
                    else:
                        out.close()


