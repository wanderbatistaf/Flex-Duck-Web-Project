import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import {Suppliers} from "@app/_models";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SuppliersService} from "@app/_services";
import {map} from "rxjs";
import jwt_decode from "jwt-decode";

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.less']
})
export class SuppliersComponent implements OnInit {
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;
  activeTab: string = 'consulta';
  loading = false;
  suppliers: Suppliers[] = [];
  filteredSupplier: Suppliers[] = [];
  searchText = '';
  formCad: FormGroup;
  formEdit: FormGroup;
  lastSupplierId: number = 0;
  submitted = false;
  selectedSupplier: any;
  levels = [
    { value: 22, name: 'Admin' },
    { value: 20, name: 'Gerente' },
    { value: 15, name: 'Supervisor' },
    { value: 10, name: 'Vendedor' },
  ];
  defaultPaymentTypes = ['Dinheiro', 'Cartão de Credito', 'TED', 'Cartão de Débito', 'PIX', 'Boleto', 'Outros'];
  defaultDeliveryTimes = [7, 15, 30, 90, 120];

  constructor(private suppliersService: SuppliersService, private fb: FormBuilder) {
    const currentDate = new Date();
    const offset = -3;
    const adjustedTimestamp = currentDate.getTime() + offset * 60 * 60 * 1000;
    const adjustedDate = new Date(adjustedTimestamp);
    const formattedCreatedAt = adjustedDate
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    this.formCad = this.fb.group({
      id: [''],
      nome: ['', [Validators.required, Validators.minLength(1)]],
      contato: ['', [Validators.required, Validators.minLength(1)]],
      detalhes_pagamento: ['', [Validators.required, Validators.minLength(1)]],
      prazo_entrega: ['', [Validators.required, Validators.minLength(1)]],
    });

    this.formEdit = this.fb.group({
      id: ['', [Validators.required, Validators.minLength(1)]],
      nome: ['', [Validators.required, Validators.minLength(1)]],
      contato: ['', [Validators.required, Validators.minLength(1)]],
      detalhes_pagamento: ['', [Validators.required, Validators.minLength(1)]],
      prazo_entrega: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
    this.getSupplier();
    this.filterSupplier(this.searchText);
  }

  // Method to format the "created_at" field
  formatCreatedAt(): string {
    const createdAt = this.formCad.get('created_at')?.value;
    const date = new Date(createdAt);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  getSupplier() {
    // Activate the loading flag
    this.loading = true;
    // Retrieve all users from the server
    this.suppliersService
      .getAll()
      .pipe(map((response: any) => response.items as Suppliers[]))
      .subscribe(
        // When the response is successful
        (suppliers: Suppliers[]) => {
          // Set the retrieved users to the class property
          this.suppliers = suppliers;
          // Deactivate the loading flag
          this.loading = false;
          // Render the users
          this.filterSupplier('');
          console.log(suppliers);
        },
        // When an error occurs in the response
        (error) => {
          console.log('An error occurred while requesting suppliers.');
        }
      );
  }

  filterSupplier(searchValue: string) {
    searchValue = searchValue.toLowerCase();
    this.filteredSupplier = this.suppliers?.filter(
      (suppliers) =>
        suppliers.nome?.toLowerCase().includes(searchValue) ||
        suppliers.contato?.toLowerCase().includes(searchValue)
    );
  }

  // Method to delete a supplier
  deleteSupplier(id: number) {
    // Display a confirmation to the supplier before proceeding
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      // Make a request to delete the supplier with the specified ID
      this.suppliersService.deleteSupplierById(id).subscribe(
        // If the request is successful, remove the supplier from the list and update the filtered list
        () => {
          console.log(`Fornecedor de ID ${id} foi deletado.`);
          this.suppliers = this.suppliers.filter((supplier) => supplier.id !== id);
          this.filterSupplier(this.searchText);
        },
        // If the request fails, display an error message in the console
        (error) => {
          console.log('An error occurred while deleting the supplier.');
        }
      );
    }
  }


  getLastSupplierId() {
    this.suppliersService.getLastSupplierId().subscribe((lastSupplierId) => {
      this.lastSupplierId = lastSupplierId + 1;
      this.formCad.get('id')?.patchValue(this.lastSupplierId);
    });
  }




  onSubmit() {
    this.submitted = true;
    console.log(this.formCad.controls);
    console.log(this.formCad.value);

    // Se o formulário for inválido, retorne
    if (this.formCad.invalid) {
      console.log('Deu ruim 06!');
      return;
    }

    // Remove o campo "id" do valor do formulário
    const { id, ...newSupplierData } = this.formCad.value;

    this.suppliersService.addSupplier(newSupplierData).subscribe(
      (newSupplier) => {
        this.suppliers.push(newSupplier);
        this.formCad.reset();

        // Redireciona para a página de consulta
        this.setActiveTab('consulta');
        this.getSupplier();
        this.filterSupplier(this.searchText);
        this.getSupplier();
      },
      (error) => {
        console.log('An error occurred while adding the supplier.');
      }
    );
  }

  getCurrentLevel(): number | null {
    const token = localStorage.getItem('access_token');

    try {
      if (token) {
        const decodedToken: any = jwt_decode(token);
        const level = decodedToken.sub.level;

        return level;
      } else {
        console.log('Token not found in LocalStorage.');
        return null;
      }
    } catch (error) {
      console.log('An error occurred while decoding the token:', error);
      return null;
    }
  }

  getLevelName(levelValue: number | null): string {
    const level = this.levels.find((level) => level.value === levelValue);
    return level ? level.name : '';
  }

  formReset() {
    this.formCad.reset();
  }

  // Função para preencher os campos na aba de edição com os dados do cliente selecionado
  editSupplier(supplier: any) {
    this.selectedSupplier = supplier;
    this.setActiveTab('edicao');
    console.log(this.selectedSupplier);

    this.formEdit.patchValue({
      id: this.selectedSupplier.id, // Use the correct property name 'user_id'
      nome: this.selectedSupplier.nome, // Use the correct property name 'username'
      contato: this.selectedSupplier.contato, // Use the correct property name 'name'
      detalhes_pagamento: this.selectedSupplier.detalhes_pagamento, // Use the correct property name 'password'
      prazo_entrega: this.selectedSupplier.prazo_entrega, // Use the correct property name 'active'
    });
  }



  onUpdate() {
    const updatedSupplier: Suppliers = this.formEdit.value;
    const supplierId = this.selectedSupplier.id;

    const confirmUpdate = confirm('Tem certeza que deseja atualizar as informações do fornecedor?');

    if (confirmUpdate) {
      this.suppliersService.updateSupplierById(supplierId, updatedSupplier).subscribe(
        (response) => {
          console.log('Usuário atualizado com sucesso', response);
          console.log(updatedSupplier);
          alert('Usuário atualizado com sucesso!');
          this.setActiveTab('consulta');
        },
        (error) => {
          console.log('Erro ao atualizar o usuário', error);
          console.log(updatedSupplier);
          // Implemente aqui o que deve acontecer em caso de erro
        }
      );
    }
  }
}
