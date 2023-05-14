# import gi
#
# gi.require_version("Gtk", "3.0")
# from gi.repository import Gtk
#
#
# class ToggleButtonWindow(Gtk.Window):
#     def __init__(self):
#         super().__init__(title="ToggleButton Demo")
#         self.set_border_width(10)
#
#         hbox = Gtk.Box(spacing=6)
#         self.add(hbox)
#
#         button = Gtk.ToggleButton(label="Button 1")
#         button.connect("toggled", self.on_button_toggled, "1")
#         hbox.pack_start(button, True, True, 0)
#
#
#     def on_button_toggled(self, button, name):
#         if button.get_active():
#             state = "on"
#         else:
#             state = "off"
#         print("Button", name, "was turned", state)
#
#
# win = ToggleButtonWindow()
# win.connect("destroy", Gtk.main_quit)
# win.show_all()
# Gtk.main()


import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk


class DialogExample(Gtk.Dialog):
    def __init__(self, parent):
        super().__init__(title="Warning!", transient_for=parent, flags=0)
        self.add_buttons(
            Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, Gtk.STOCK_OK, Gtk.ResponseType.OK
        )

        self.set_default_size(150, 100)

        label = Gtk.Label(label="Deseja realmente excluir o cliente:")

        box = self.get_content_area()
        box.add(label)
        self.show_all()


class DialogWindow(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="Dialog Example")

        self.set_border_width(6)

        button = Gtk.Button(label="Open dialog")
        button.connect("clicked", self.on_button_clicked)

        self.add(button)

    def on_button_clicked(self, widget):
        dialog = DialogExample(self)
        response = dialog.run()

        if response == Gtk.ResponseType.OK:
            print("The OK button was clicked")
        elif response == Gtk.ResponseType.CANCEL:
            print("The Cancel button was clicked")

        dialog.destroy()


win = DialogWindow()
win.connect("destroy", Gtk.main_quit)
win.show_all()
Gtk.main()