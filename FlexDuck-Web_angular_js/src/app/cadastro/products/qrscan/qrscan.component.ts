import { Component, OnInit } from '@angular/core';
import {ProductService} from "@app/_services";
import {Products} from "@app/_models";
import { Router } from '@angular/router';

@Component({
  selector: 'app-qrscan',
  templateUrl: './qrscan.component.html',
  styleUrls: ['./qrscan.component.less']
})
export class QrscanComponent implements OnInit {
  currentUrl: string;

  constructor( private productsService:ProductService, private router: Router) {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    const urlParts = this.currentUrl.split('/');
    const codigo = urlParts[urlParts.length - 1];
    this.getProductInfos('P000001');
  }


  getProductInfos(codigo: string) {
    this.productsService.ScanQRcode(codigo).subscribe(
      (produto: Products) => {
        // Faça o que for necessário com as informações do produto
        console.log(produto);
      },
      (error) => {
        console.log('Ocorreu um erro ao buscar as informações do produto.');
      }
    );
  }

}
