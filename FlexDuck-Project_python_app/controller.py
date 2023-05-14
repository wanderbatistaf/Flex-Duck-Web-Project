# -*- coding: utf-8 -*-
import requests
from peewee import Table
from model import db, Usuarios

__all__ = ["ControllerModelPycFile"]

class ControllerModelPycFile(object):
    def __init__(self, *args):
        ...

    def search_user(self, localizar1):
        tb_flexduck_user = Table("usuarios")
        query = (
            tb_flexduck_user.select(
                tb_flexduck_user.c.idcliente,
                tb_flexduck_user.c.nome,
                tb_flexduck_user.c.razaosocial,
                tb_flexduck_user.c.cnpjcpf,
                tb_flexduck_user.c.ie,
                tb_flexduck_user.c.im,
                tb_flexduck_user.c.celular,
                tb_flexduck_user.c.fixo,
                tb_flexduck_user.c.recado,
                tb_flexduck_user.c.email,
                tb_flexduck_user.c.created_at,
                tb_flexduck_user.c.inactive_since,
                tb_flexduck_user.c.blocked_since,
                tb_flexduck_user.c.cep,
                tb_flexduck_user.c.street,
                tb_flexduck_user.c.district,
                tb_flexduck_user.c.city,
                tb_flexduck_user.c.state,
                tb_flexduck_user.c.telephone,
                tb_flexduck_user.c.cellphone,
                tb_flexduck_user.c.errands,
                tb_flexduck_user.c.instagram,
                tb_flexduck_user.c.website,
                tb_flexduck_user.c.natural_person,
                tb_flexduck_user.c.inactive_status,
                tb_flexduck_user.c.blocked_status,
            ).where((tb_flexduck_user.c.idcliente == localizar1) |
                    (tb_flexduck_user.c.nome ** (f"%{(localizar1)}%") |
                    (tb_flexduck_user.c.razaosocial ** (f"%{(localizar1)}%") |
                    (tb_flexduck_user.c.celular == localizar1)
        ))))

        # return query.execute(db)[0]

        records = db.execute(query)
        rows = []
        for row in records.fetchmany():
            rows.append({'idcliente': row[0], 'nome': row[1], 'razaosocial': row[2], 'cnpjcpf': row[3],
                          'ie': row[4], 'im': row[5], 'celular': row[6], 'fixo': row[7], 'recado': row[8],
                          'email': row[9], 'created_at': row[10], 'inactive_since': row[11], 'blocked_since': row[12],
                          'cep': row[13], 'street': row[14], 'district': row[15], 'city': row[16], 'state': row[17],
                          'telephone': row[18], 'cellphone': row[19], 'errands': row[20], 'instagram': row[21],
                          'website': row[22], 'natural_person': row[23], 'inactive_status': row[24], 'blocked_status': row[25]})
            print (rows)
        return rows[0]

        # records = db.execute(query)
        # rows = []
        # row = records.fetchone()
        # while row is not None:
        #     rows.append(row)
        #     row = records.fetchone()
        #     print(rows)
        # return rows[0]

    def insert_user(self, nome, razaosocial, cnpjcpf, ie, im, celular, fixo, recado, email, created_at, inactive_since,
                    blocked_since, cep, street, district, city, state, telephone, cellphone, errands, instagram, website,
                    natural_person, inactive_status, blocked_status):
        query = Usuarios(
            nome=nome,
            razaosocial=razaosocial,
            cnpjcpf=cnpjcpf,
            ie=ie,
            im=im,
            celular=celular,
            fixo=fixo,
            recado=recado,
            email=email,
            created_at=created_at,
            inactive_since=inactive_since,
            blocked_since=blocked_since,
            cep=cep,
            street=street,
            district=district,
            city=city,
            state=state,
            telephone=telephone,
            cellphone=cellphone,
            errands=errands,
            instagram=instagram,
            website=website,
            natural_person=natural_person,
            inactive_status=inactive_status,
            blocked_status=blocked_status
        )
        query.save()

    def update_user(self, idcliente, new_nome, new_razaosocial, new_cnpjcpf, new_ie,
                    new_im, new_celular, new_fixo, new_recado, new_email, new_created_at,
                    new_inactive_since, new_blocked_since, new_cep, new_street, new_district,
                    new_city, new_state, new_telephone, new_cellphone, new_errands, new_instagram,
                    new_website, new_natural_person, inactive_status, blocked_status):
        tb_flexduck_user = Table("usuarios")

        nrows = (tb_flexduck_user
                 .update(nome=new_nome,
                         razaosocial=new_razaosocial,
                         cnpjcpf=new_cnpjcpf,
                         ie=new_ie,
                         im=new_im,
                         celular=new_celular,
                         fixo=new_fixo,
                         recado=new_recado,
                         email=new_email,
                         created_at=new_created_at,
                         inactive_since=new_inactive_since,
                         blocked_since=new_blocked_since,
                         cep=new_cep,
                         street=new_street,
                         district=new_district,
                         city=new_city,
                         state=new_state,
                         telephone=new_telephone,
                         cellphone=new_cellphone,
                         errands=new_errands,
                         instagram=new_instagram,
                         website=new_website,
                         natural_person=new_natural_person,
                         inactive_status=inactive_status,
                         blocked_status=blocked_status
                         )
                 .where(tb_flexduck_user.c.idcliente == idcliente)
                 )
        print(nrows)
        nrows.execute(db)

    def delete_user(self, idcliente):
        tb_flexduck_user = Table("usuarios")
        query = tb_flexduck_user.delete().where(
            tb_flexduck_user.c.idcliente == idcliente
        )
        query.execute(db)
    
    def search_file_id(self, code):
        tb_pyc_file = Table("ModelPycFile")
        query = (
            tb_pyc_file.select( 
                tb_pyc_file.c.file_name,
                tb_pyc_file.c.file
            ).where(tb_pyc_file.c.id == code)
        )

        return query.execute(db)[0]

    def consuming_cep(self, cep):

        cep = cep.replace("-", "").replace(".", "").replace(" ", "")

        if len(cep) == 8:
            link = f'https://viacep.com.br/ws/{cep}/json/'

            requisicao = requests.get(link)

            dic_requisicao = requisicao.json()

            logradouro = dic_requisicao["logradouro"]
            uf = dic_requisicao["uf"]
            localidade = dic_requisicao["localidade"]
            bairro = dic_requisicao["bairro"]

            return [logradouro, bairro,localidade,uf]

            print(dic_requisicao)
        else:
            print("Cep Invalido")