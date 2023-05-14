import csv
import time
import model
import os
import platform


__all__ = ["ReportClients"]

class ReportClients(object):
    def __init__(self, *args):
        ...


    def getidreport(self, idcliente, filename):
        save_path = "./Reports/"
        save_windows_path = ".\\Reports\\"
        if idcliente == "":
            mydata = model.Usuarios.select().tuples()
            print("Writing to csv: {} ...".format(filename))
            completeName = os.path.join(save_path, filename)
            with open(completeName.format(time.time_ns()), 'w', newline='') as out:
                print(mydata)
                csvOut = csv.writer(out)
                headers = [x for x in model.Usuarios._meta.sorted_field_names]
                csvOut.writerow(headers)
                for row in mydata:
                    csvOut.writerow(row)
                    print(row)
                if platform.system() == "Windows":
                    os.startfile(save_windows_path)
                elif platform.system() == "Darwing":
                    import subprocess
                    subprocess.call(["open", "-R", save_path])
                else:
                    import subprocess
                    subprocess.Popen(["xdg-open", save_path])
            out.close()
        else:
            mydata = model.Usuarios.select().where(model.Usuarios.idcliente == idcliente).tuples()
            print("Writing to csv: {} ...".format(filename))
            completeName = os.path.join(save_path, filename)
            with open(completeName.format(time.time_ns()), 'w', newline='') as out:
                print(mydata)
                csvOut = csv.writer(out)
                headers = [x for x in model.Usuarios._meta.sorted_field_names]
                csvOut.writerow(headers)
                for row in mydata:
                    csvOut.writerow(row)
                    print(row)
                if platform.system() == "Windows":
                    os.startfile(save_windows_path)
                elif platform.system() == "Darwing":
                    import subprocess
                    subprocess.call(["open", "-R", save_path])
                else:
                    import subprocess
                    subprocess.Popen(["xdg-open", save_path])
            out.close()


