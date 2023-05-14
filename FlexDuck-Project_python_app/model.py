# -*- coding: utf-8 -*-

import os
from peewee import *

db = SqliteDatabase(os.curdir + os.path.sep + "data" + os.path.sep + "flexduck.db")
__all__ = ["Usuarios", "Meta"]


class Usuarios(Model):
    idcliente = IntegerField(primary_key=True)
    razaosocial = CharField(max_length=256, null=False)
    nome = CharField(max_length=256, null=False)
    cnpjcpf = CharField(max_length=11, null=False)
    ie = CharField(max_length=50, null=False)
    im = CharField(max_length=50, null=False)
    celular = CharField(max_length=20, null=False)
    fixo = CharField(max_length=20, null=False)
    recado = CharField(max_length=20, null=False)
    email = CharField(max_length=20, null=False)
    created_at = DateTimeField(null=False)
    inactive_since = DateTimeField(null=False)
    blocked_since = DateTimeField(null=False)
    cep = CharField(max_length=8, null=False)
    street = CharField(max_length=256, null=False)
    district = CharField(max_length=256, null=False)
    city = CharField(max_length=256, null=False)
    state = CharField(max_length=256, null=False)
    telephone = CharField(max_length=10, null=False)
    cellphone = CharField(max_length=11, null=False)
    errands = CharField(max_length=11, null=False)
    instagram = CharField(max_length=256, null=False)
    website = CharField(max_length=256, null=False)
    natural_person = BooleanField(null=False)
    inactive_status = BooleanField(null=False)
    blocked_status = BooleanField(null=False)



    class Meta:
        database = db


if __name__ == "__main__":
    """ create table if not exists usuarios """
    db.create_tables([Usuarios])