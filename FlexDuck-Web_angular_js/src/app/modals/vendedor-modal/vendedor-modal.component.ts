import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { User } from "@app/_models";
import {UserService} from "@app/_services";
import {SharedService} from "@app/_services/SharedService";

// Crie uma interface para o tipo de dados que você precisa
interface Vendor {
  user_id: number;
  name: string;
}

@Pipe({
  name: 'filter'
})
export class FilterPipeV implements PipeTransform {
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
  selector: 'app-vendedor-modal',
  templateUrl: './vendedor-modal.component.html',
  styleUrls: ['./vendedor-modal.component.less']
})
export class VendedorModalComponent implements OnInit {
  private modalRef?: NgbModalRef;
  vendedores: Vendor[] = [];
  private currentUser?: number;
  loading: boolean = true;
  pesquisaProduto: string = '';
  isLoading: boolean = true;
  constructor(private modalService: NgbModal,
              public activeModal: NgbActiveModal,
              private usersService: UserService,
              private sharedService: SharedService) { }

  ngOnInit(): void {
    this.getVendor()
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  getVendor() {
    this.loading = true;
    // Retrieve all users from the server
    this.usersService.getAll().subscribe(
      (response: any) => {
        const users = response.items as User[];

        // Filter the users to get only the vendedores
        const vendedores: Vendor[] = users
          .filter((user) => user.level === 5) // Assuming the level 5 represents vendedores
          .map((user) => ({
            user_id: user.user_id,
            name: user.name,
            levelText: this.getLevelText(user.level),
            isCurrentUser: user.user_id === this.currentUser,
          }));

        // Set the retrieved vendedores to the class property
        this.vendedores = vendedores;
        this.loading = false;
      },
      (error) => {
        console.log('An error occurred while requesting users.');
        this.isLoading = false;
      }
    );
    this.isLoading = false;
  }

// Helper method to get the level text based on the user level
  getLevelText(level: number): string {
    switch (level) {
      case 22:
        return 'Admin';
      case 15:
        return 'Gerente';
      case 10:
        return 'Supervisor';
      case 5:
        return 'Vendedor';
      default:
        return '';
    }
  }

  selecionarVendedor(vendedor: Vendor) {
    // Atualiza os valores compartilhados do Id e do Vendedor
    this.sharedService.selectedId = vendedor.user_id;
    this.sharedService.selectedVendedor = vendedor.name;

    // Fecha o modal
    this.activeModal.close();

    // Chama a função para atualizar os campos de input no SalesComponent
    this.sharedService.updateFieldsVendor();

  }


}
