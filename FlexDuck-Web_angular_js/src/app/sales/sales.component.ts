import {Component, OnInit, ElementRef, Inject, ViewChild, HostListener} from '@angular/core';
import {Paytype, Products, Sales, Suppliers} from '@app/_models';
import {FuncPaymentsService, ProductService, SuppliersService, UserService} from '@app/_services';
import { map } from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators, ɵElement} from '@angular/forms';
import { JwtHelperService } from "@auth0/angular-jwt";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {ClienteModalComponent} from "@app/modals/cliente-modal/cliente-modal.component";
import {VendedorModalComponent} from "@app/modals/vendedor-modal/vendedor-modal.component";
import {ProdutoModalComponent} from "@app/modals/produto-modal/produto-modal.component";



@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})


export class SalesComponent implements OnInit {
  @ViewChild('clienteModal') clienteModal: any;
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;
  loading = false;
  qrcode: string = ''
  products: Products[] = [];
  paytypes: any[] = [];
  private modalRef: NgbModalRef | undefined;

  constructor(private usersService: UserService,
              private fb: FormBuilder,
              private router: Router,
              private productService: ProductService,
              private paytypeService: FuncPaymentsService,
              private http: HttpClient,
              private formBuilder: FormBuilder,
              private modalService: NgbModal) {
  }

// Executa ao inicializar o componente
  ngOnInit() {
    const token = localStorage.getItem('token');
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
    this.buscarPaytypes();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (this.modalRef && !this.modalRef.componentInstance.location.nativeElement.contains(event.target)) {
      this.closeModal();
    }
  }

  buscarPaytypes() {
    this.paytypeService.getAllPayTypes().subscribe(
      (paytypes: Paytype[]) => {
        this.paytypes = paytypes.map((paytype: Paytype) => ({ id: paytype.forma_pagamento_id, nome: paytype.descricao }));
        this.loading = false;
        console.log(this.paytypes);
      },
      (error) => {
        console.log('Ocorreu um erro ao solicitar os tipos de pagamento.');
      }
    );
  }

  openSearchModal() {
    this.modalService.open(ClienteModalComponent, {
      ariaLabelledBy: 'modal-title',
      modalDialogClass: 'modal-xl',
      // backdrop: true,
      backdrop: false, // Desabilita o backdrop
    });

    // Adicione o listener de evento para fechar o modal ao clicar fora dele
    if (this.modalRef) {
      this.modalRef.result
        .then(
          (result) => {},
          (reason) => {
            if (reason === 'outside') {
              this.closeModal();
            }
          }
        )
        .catch((error) => {
          console.log('Erro ao fechar o modal:', error);
        });
    }
  }

  openVendorModal() {
    this.modalService.open(VendedorModalComponent, {
      ariaLabelledBy: 'modal-title',
      modalDialogClass: 'modal-xl',
      // backdrop: true,
      backdrop: false, // Desabilita o backdrop
    });

    // Adicione o listener de evento para fechar o modal ao clicar fora dele
    if (this.modalRef) {
      this.modalRef.result
        .then(
          (result) => {},
          (reason) => {
            if (reason === 'outside') {
              this.closeModal();
            }
          }
        )
        .catch((error) => {
          console.log('Erro ao fechar o modal:', error);
        });
    }
  }

  openProdutoModal() {
    this.modalService.open(ProdutoModalComponent, {
      ariaLabelledBy: 'modal-title',
      modalDialogClass: 'modal-xl',
      // backdrop: true,
      backdrop: false, // Desabilita o backdrop
    });

    // Adicione o listener de evento para fechar o modal ao clicar fora dele
    if (this.modalRef) {
      this.modalRef.result
        .then(
          (result) => {},
          (reason) => {
            if (reason === 'outside') {
              this.closeModal();
            }
          }
        )
        .catch((error) => {
          console.log('Erro ao fechar o modal:', error);
        });
    }
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }



}
