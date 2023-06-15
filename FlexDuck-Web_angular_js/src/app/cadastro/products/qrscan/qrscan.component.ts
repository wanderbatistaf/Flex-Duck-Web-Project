import { Component, OnInit } from '@angular/core';
import { ProductService } from '@app/_services';
import { Products } from '@app/_models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-qrscan',
  templateUrl: './qrscan.component.html',
  styleUrls: ['./qrscan.component.less']
})
export class QrscanComponent implements OnInit {
  urlproduct: string = '';
  produto: Products | undefined;

  constructor(private productsService: ProductService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const codigo = params['codigo'];
      if (codigo) {
        this.getProductInfos(codigo);
      }
    });
  }



  getProductInfos(codigo: string) {
    // Faça a chamada à API para obter as informações do produto
    this.productsService.ScanQRcode(codigo).subscribe(
      (response: any) => {
        if (response.mensagem === 'Produto localizado com sucesso!' && Array.isArray(response.produto) && response.produto.length === 5) {
          this.produto = {
            codigo: response.produto[0],
            nome: response.produto[1],
            quantidade: response.produto[2],
            preco_venda: response.produto[3],
            descricao: response.produto[4]
          };
        } else {
          console.log('Os dados do produto não foram retornados corretamente.');
        }
      },
      (error) => {
        console.log('Ocorreu um erro ao buscar as informações do produto.');
      }
    );
  }


}
