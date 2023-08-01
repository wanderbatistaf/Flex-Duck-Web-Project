import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {NgbActiveModal, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { Clients } from "@app/_models";
import {map} from "rxjs/operators";
import {ClientsService} from "@app/_services";
import {SharedService} from "@app/_services/SharedService";

interface Client {
  business_name: string;
  cnpj_cpf: string;
  telephone: string;
  id: string;
}

@Pipe({
  name: 'filter'
})
export class FilterPipeC implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText || !searchText.trim()) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter((item) => {
      const keys = Object.keys(item);
      return keys.some((key) => item[key] && item[key].toString().toLowerCase().includes(searchText));
    });
  }
}


@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.less']
})
export class ClienteModalComponent implements OnInit {
  private modalRef?: NgbModalRef;
  clientes: Clients[] = [];
  isLoading: boolean = true;
  private selectedClienteName!: string;
  private selectedClienteCPF_CNPJ!: string;
  private selectedClienteTelephone!: string;
  private SelectedClienteId!:string;
  pesquisaProduto: string = '';


  constructor(private modalService: NgbModal,
              public activeModal: NgbActiveModal,
              private clientsService: ClientsService,
              public sharedService: SharedService) { }

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false; // Após o carregamento dos dados, definimos loading como false
    }, 2000);
    this.getClientsVendas();
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


  getClientsVendas() {
    this.isLoading = true;
    // Recupera todos os pagamentos do servidor
    this.clientsService.getAllVendas()
      .pipe(
        map((response: any) => response.items as Clients[])
      )
      .subscribe(
        // Quando a resposta for bem-sucedida
        (clientes: Clients[]) => {
          // Define os pagamentos recuperados na propriedade da classe
          this.clientes = clientes;
          this.isLoading = false;
          // Renderiza os pagamentos
          console.log(clientes);
        },
        // Quando ocorrer um erro na resposta
        error => {
          console.log('Houve um erro ao requisitar os clientes.');
        }
      );
    console.log(this.clientes);
  }

  selecionarClient(cliente: Clients) {
    // Verifica se o objeto selectedCliente está definido
    if (!this.sharedService.selectedCliente) {
      this.sharedService.selectedCliente = {} as Client;
    }

    // Atualiza os valores compartilhados do cliente
    if (cliente.business_name != null) {
      this.sharedService.selectedCliente.business_name = cliente.business_name;
    }
    this.sharedService.selectedCliente.cnpj_cpf = String(cliente.cnpj_cpf?.toString());
    this.sharedService.selectedCliente.telephone = String(cliente.telephone?.toString());
    this.sharedService.selectedCliente.id = String(cliente.id?.toString());

    console.log(cliente.business_name);
    console.log(cliente.cnpj_cpf);
    console.log(cliente.telephone);
    console.log(cliente.id);

    // Fecha o modal
    this.activeModal.close();

    // Chama a função para atualizar os campos de input no SalesComponent
    this.sharedService.updateFieldsClient();
    this.updateFields()
  }


  updateFields() {
    this.selectedClienteName = this.sharedService.selectedCliente.business_name;
    this.selectedClienteCPF_CNPJ = this.sharedService.selectedCliente.cnpj_cpf;
    this.selectedClienteTelephone = this.sharedService.selectedCliente.telephone;
    this.SelectedClienteId = this.sharedService.selectedCliente.id;
  }







}
