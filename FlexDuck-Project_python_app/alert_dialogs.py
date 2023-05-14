
import gi

gi.require_version('Gtk', '3.0')
from gi.repository import Gtk


class AlertExcluir(Gtk.Dialog):
    def __init__(self, parent):
        super().__init__(title="Warning!", flags=0)
        self.add_buttons(
            Gtk.STOCK_NO, Gtk.ResponseType.NO, Gtk.STOCK_YES, Gtk.ResponseType.YES
        )
        self.set_default_size(150,100)

        label = Gtk.Label(label=f"Tem certeza que deseja excluir o cliente?")

        box= self.get_content_area()
        box.add(label)
        self.show_all()

class AlertAdicionar(Gtk.Dialog):
    def __init__(self, parent):
        super().__init__(title="Warning!", flags=0)
        self.add_buttons(
            Gtk.STOCK_NO, Gtk.ResponseType.NO, Gtk.STOCK_YES, Gtk.ResponseType.YES
        )
        self.set_default_size(150,100)

        label = Gtk.Label(label=f"Tem certeza que deseja adicionar o cliente ?")

        box= self.get_content_area()
        box.add(label)
        self.show_all()

class AlertImprimirRelatorio(Gtk.Dialog):
    def __init__(self, parent):
        super().__init__(title="Warning!", flags=0)
        self.add_buttons(
            Gtk.STOCK_NO, Gtk.ResponseType.NO, Gtk.STOCK_YES, Gtk.ResponseType.YES
        )
        self.set_default_size(150,100)

        label = Gtk.Label(label=f"Tem certeza que deseja imprimir em .CSV o relatório ?")

        box= self.get_content_area()
        box.add(label)
        self.show_all()

class AlertEditUserStart(Gtk.Dialog):
    def __init__(self, parent):
        super().__init__(title="Warning!", flags=0)
        self.add_buttons(
            Gtk.STOCK_NO, Gtk.ResponseType.NO, Gtk.STOCK_YES, Gtk.ResponseType.YES
        )
        self.set_default_size(150,100)

        label = Gtk.Label(label=f"Tem certeza que deseja editar o cliente ?")

        box= self.get_content_area()
        box.add(label)
        self.show_all()

class AlertEditUserEnd(Gtk.Dialog):
    def __init__(self, parent):
        super().__init__(title="Warning!", flags=0)
        self.add_buttons(
            Gtk.STOCK_NO, Gtk.ResponseType.NO, Gtk.STOCK_YES, Gtk.ResponseType.YES
        )
        self.set_default_size(150,100)

        label = Gtk.Label(label=f"Tem certeza que deseja salvar as alterações no cliente ?")

        box= self.get_content_area()
        box.add(label)
        self.show_all()