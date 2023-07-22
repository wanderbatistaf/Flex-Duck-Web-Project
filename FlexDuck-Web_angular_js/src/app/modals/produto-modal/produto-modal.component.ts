import { Component, OnInit } from '@angular/core';
import { Products } from "@app/_models";
import {NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {map} from "rxjs";
import {ProductService, SuppliersService, UserService} from "@app/_services";
import {FormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-produto-modal',
  templateUrl: './produto-modal.component.html',
  styleUrls: ['./produto-modal.component.less']
})
export class ProdutoModalComponent implements OnInit {
  private modalRef?: NgbModalRef;
  produtos: Products[] = [];

  constructor(private router: Router,
              private productService: ProductService,
              private http: HttpClient,
              private formBuilder: FormBuilder) { }

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
          console.log(produtos);
        },
        // Quando ocorrer um erro na resposta
        error => {
          console.log('Houve um erro ao requisitar os produtos.');
        }
      );
  }

}
