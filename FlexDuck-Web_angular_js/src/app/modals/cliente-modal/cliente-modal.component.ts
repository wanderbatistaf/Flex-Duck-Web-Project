import { Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { Clients } from "@app/_models";
import {map} from "rxjs/operators";
import {ClientsService} from "@app/_services";

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.less']
})
export class ClienteModalComponent implements OnInit {
  private modalRef?: NgbModalRef;
  clientes: Clients[] = [];

  constructor(private modalService: NgbModal,
              public activeModal: NgbActiveModal,
              private clientsService: ClientsService) { }

  ngOnInit() {
    this.getClients()
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

  getClients() {
    // Recupera todos os pagamentos do servidor
    this.clientsService.getAll()
      .pipe(
        map((response: any) => response.items as Clients[])
      )
      .subscribe(
        // Quando a resposta for bem-sucedida
        (clientes: Clients[]) => {
          // Define os pagamentos recuperados na propriedade da classe
          this.clientes = clientes;
          // Renderiza os pagamentos
          console.log(clientes);
        },
        // Quando ocorrer um erro na resposta
        error => {
          console.log('Houve um erro ao requisitar os clientes.');
        }
      );
  }




}
