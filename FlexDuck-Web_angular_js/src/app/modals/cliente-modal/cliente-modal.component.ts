import { Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { Clients } from "@app/_models";

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.less']
})
export class ClienteModalComponent implements OnInit {
  private modalRef?: NgbModalRef;
  clientes: Clients[] = [
    { business_name: 'Cliente 1', cnpj_cpf: '111.111.111-11', telephone: 1111111111 },
    { business_name: 'Cliente 2', cnpj_cpf: '222.222.222-22', telephone: 2222222222 },
    { business_name: 'Cliente 3', cnpj_cpf: '333.333.333-33', telephone: 3333333333 },
    { business_name: 'Cliente 4', cnpj_cpf: '444.444.444-44', telephone: 4444444444 },
    { business_name: 'Cliente 5', cnpj_cpf: '555.555.555-55', telephone: 5555555555 }
  ];

  constructor(private modalService: NgbModal,
              public activeModal: NgbActiveModal) { }

  ngOnInit() {
    backdrop:true
  }

  closeModal() {
    const modalElement = document.querySelector('.modal');
    if (modalElement) {
      modalElement.classList.remove('show');
      document.body.classList.remove('modal-open');
      const backdropElement = document.querySelector('.modal-backdrop');
      if (backdropElement) {
        backdropElement.remove();
      }
    }
  }

  adicionarCliente() {
    // Aqui você pode obter os valores dos campos Nome, CPF e Telefone e adicionar o cliente na lista de clientes.
    // Exemplo:
    const nome = (<HTMLInputElement>document.getElementById('nomeCliente')).value;
    const cpf = (<HTMLInputElement>document.getElementById('cpfCliente')).value;
    const telefone = (<HTMLInputElement>document.getElementById('telefoneCliente')).value;

    // Adicionar o cliente na lista de clientes (você pode ter uma lista de clientes no seu componente)
    // Exemplo:
    // this.listaDeClientes.push({ nome, cpf, telefone });

    // Fechar o modal após adicionar o cliente
    // this.modalService.dismiss('clienteModal');
  }




}
