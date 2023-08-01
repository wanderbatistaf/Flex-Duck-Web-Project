import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Clients, Products} from "@app/_models";
import {NgbActiveModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {map} from "rxjs";
import {ProductService, SuppliersService, UserService} from "@app/_services";
import {FormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {SharedService} from "@app/_services/SharedService";

@Pipe({
  name: 'filter'
})
export class FilterPipeP implements PipeTransform {
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
  selector: 'app-produto-modal',
  templateUrl: './produto-modal.component.html',
  styleUrls: ['./produto-modal.component.less']
})
export class ProdutoModalComponent implements OnInit {
  private modalRef?: NgbModalRef;
  produtos: Products[] = [];
  loading: boolean = true;
  pesquisaProduto: string = '';

  constructor(private router: Router,
              private productService: ProductService,
              public activeModal: NgbActiveModal,
              public sharedService: SharedService) { }

  ngOnInit(): void {
    this.getProduct()
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

  getProduct() {
    this.loading = true;
    // Recupera todos os pagamentos do servidor
    this.productService.getAllProducts()
      .pipe(
        map((response: any) => response.items as Products[])
      )
      .subscribe(
        // Quando a resposta for bem-sucedida
        (produtos: Products[]) => {
          // Define os pagamentos recuperados na propriedade da classe
          this.produtos = produtos;
          this.loading = false;
          console.log(produtos);
        },
        // Quando ocorrer um erro na resposta
        error => {
          console.log('Houve um erro ao requisitar os produtos.');
        }
      );
  }

  selecionarProduto(produto: Products) {
    // Verifica se o objeto selectedCliente está definido
    if (!this.sharedService.selectedProduto) {
      this.sharedService.selectedProduto = {} as Products;
    }

    // Atualiza os valores compartilhados do cliente
    if (produto.nome != null) {
      this.sharedService.selectedProduto.nome = produto.nome;
    }
    this.sharedService.selectedProduto.codigo = String(produto.codigo?.toString());


    console.log(produto.codigo);
    console.log(produto.nome);

    // Fecha o modal
    this.activeModal.close();

    // Chama a função para atualizar os campos de input no SalesComponent
    this.sharedService.updateFieldsProduto();
  }

}
