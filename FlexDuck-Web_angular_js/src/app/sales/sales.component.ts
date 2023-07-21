import { Component, OnInit, ElementRef } from '@angular/core';
import {Paytype, Products, Sales, Suppliers} from '@app/_models';
import {FuncPaymentsService, ProductService, SuppliersService, UserService} from '@app/_services';
import { map } from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators, ɵElement} from '@angular/forms';
import { JwtHelperService } from "@auth0/angular-jwt";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";



@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})


export class SalesComponent implements OnInit {
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;
  loading = false;
  qrcode: string = ''
  products: Products[] = [];
  paytypes: any[] = [];

  constructor(private usersService: UserService,
              private fb: FormBuilder,
              private router: Router,
              private productService: ProductService,
              private paytypeService: FuncPaymentsService,
              private http: HttpClient,
              private formBuilder: FormBuilder) {
  }

// Executa ao inicializar o componente
  ngOnInit() {
    const token = localStorage.getItem('token');
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
    this.buscarPaytypes();
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

}
