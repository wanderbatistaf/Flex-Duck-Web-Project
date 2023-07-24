// shared.service.ts
import { Injectable } from '@angular/core';
import { Products } from "@app/_models";

interface Client {
  business_name: string;
  cnpj_cpf: string;
  telephone: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  selectedId!: number;
  selectedVendedor!: string;
  selectedCliente!: Client;
  selectedProduto!: Products;

  constructor() {
  }

  // Função para atualizar os campos de input com os valores selecionados no modal
  updateFieldsVendor() {
    const inputId = document.getElementById('inputVendedorID') as HTMLInputElement;
    if (inputId) {
      inputId.value = this.selectedId ? this.selectedId.toString() : '';
    }

    const inputVendedor = document.getElementById('inputVendedor') as HTMLInputElement;
    if (inputVendedor) {
      inputVendedor.value = this.selectedVendedor || '';
    }
  }

  updateFieldsClient() {
    const inputClienteNome = document.getElementById('inputCliente') as HTMLInputElement;
    const inputClienteCpf_Cnpj = document.getElementById('inputCpf') as HTMLInputElement;
    const inputClienteTelefone = document.getElementById('inputTelefone') as HTMLInputElement;
    if (inputClienteNome && inputClienteCpf_Cnpj && inputClienteTelefone) {
      inputClienteNome.value = this.selectedCliente.business_name || '';
      inputClienteCpf_Cnpj.value = this.selectedCliente.cnpj_cpf || '';
      inputClienteTelefone.value = this.selectedCliente.telephone || '';
    }

  }

  updateFieldsProduto() {
    const inputProdutoCodigo = document.getElementById('codigoProduto') as HTMLInputElement;
    const inputProdutoNome = document.getElementById('inputProduto') as HTMLInputElement;
    if (inputProdutoCodigo && inputProdutoNome) {
      inputProdutoCodigo.value = this.selectedProduto?.codigo || '';
      inputProdutoNome.value = this.selectedProduto?.nome || '';
      (document.getElementById('inputQuantidade') as HTMLInputElement).value = '1';
    }

  }
}
