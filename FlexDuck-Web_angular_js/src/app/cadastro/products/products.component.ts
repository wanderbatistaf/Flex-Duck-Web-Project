import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";
import {Products, Suppliers, User} from "@app/_models";
import {FormBuilder, FormGroup, Validators, ɵElement} from "@angular/forms";
import { UserService, ProductService, SuppliersService } from "@app/_services";
import { Router } from "@angular/router";
import { map } from "rxjs";
import jwt_decode from "jwt-decode";
import { HttpClient } from "@angular/common/http";
import {environment} from "@environments/environment";
import * as pdfMake from 'pdfmake/build/pdfmake'
import { PageOrientation, TDocumentDefinitions } from 'pdfmake/interfaces';
import html2canvas from "html2canvas";



@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.less']
})
export class ProductsComponent implements OnInit {
  @ViewChild('content') content!: ElementRef;
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;
  activeTab: string = 'consulta';
  loading = false;
  qrcode: string = ''
  products: Products[] = [];
  filteredProduct: Products[] = [];
  searchText = '';
  currentUser: number = -1;
  formCad: FormGroup;
  formEdit: FormGroup;
  submitted = false;
  valor: number = 0;
  selectedProduct: any;
  produtoAtivo: any;
  botaoAtivo: boolean = false;
  lastProductCode: string = 'P000000';
  public passwordVisible: boolean = false;
  levels = [
    { value: 22, name: 'Admin' },
    { value: 15, name: 'Gerente' },
    { value: 10, name: 'Supervisor' },
    { value: 5, name: 'Vendedor' },
  ];
  fornecedores: any[] = [];
  currentLevel: any;
  public form: FormGroup<{
    [K in keyof { margem_lucro: any[]; preco_venda: any[]; preco_custo: any[] }]: ɵElement<{
      margem_lucro: any[];
      preco_venda: any[];
      preco_custo: any[]
    }[K], null>
  }>;
  _margemLucro: number;
  mostrarInput: boolean = false;

  constructor(private usersService: UserService,
              private fb: FormBuilder,
              private router: Router,
              private productService: ProductService,
              private suppliersService: SuppliersService,
              private http: HttpClient,
              private formBuilder: FormBuilder) {

    this.form = this.formBuilder.group({
      preco_custo: [],
      preco_venda: [],
      margem_lucro: []
    });

    const currentDate = new Date();
    const offset = -3;
    const adjustedTimestamp = currentDate.getTime() + offset * 60 * 60 * 1000;
    const adjustedDate = new Date(adjustedTimestamp);
    const formattedCreatedAt = adjustedDate
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    this.formCad = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(1)]],
      descricao: ['', [Validators.required, Validators.minLength(1)]],
      nome: ['', [Validators.required, Validators.minLength(1)]],
      categoria: ['', [Validators.required, Validators.minLength(1)]],
      marca: ['', [Validators.required, Validators.minLength(1)]],
      preco_venda: [0.00, [Validators.required]],
      preco_custo: [0.00, [Validators.required]],
      margem_lucro: ['', [Validators.required]],
      quantidade: ['', [Validators.required, Validators.min(0)]],
      localizacao: null,
      created_at: [formattedCreatedAt],
      estoque_minimo: [1, [Validators.required, Validators.minLength(1)]],
      estoque_maximo: [9999, [Validators.required, Validators.min(0)]],
      alerta_reposicao: [10, [Validators.required, Validators.minLength(1)]],
      fornecedor_id: ['', [Validators.required, Validators.minLength(1)]],
      fornecedor_nome: ['', [Validators.required, Validators.minLength(1)]],
      is_product: [1],

    });

    this.formEdit = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(1)]],
      descricao: ['', [Validators.required, Validators.minLength(1)]],
      nome: ['', [Validators.required, Validators.minLength(1)]],
      categoria: ['', [Validators.required, Validators.minLength(1)]],
      marca: ['', [Validators.required, Validators.minLength(1)]],
      preco_venda: [0.00, [Validators.required]],
      preco_custo: [0.00, [Validators.required]],
      margem_lucro: ['', [Validators.required]],
      quantidade: ['', [Validators.required, Validators.min(0)]],
      localizacao: null,
      created_at: [formattedCreatedAt],
      estoque_minimo: ['', [Validators.required, Validators.minLength(1)]],
      estoque_maximo: ['', [Validators.required, Validators.min(0)]],
      alerta_reposicao: ['', [Validators.required, Validators.minLength(1)]],
      fornecedor_id: ['', [Validators.required, Validators.minLength(1)]],
      fornecedor_nome: ['', [Validators.required, Validators.minLength(1)]],
      is_product: [1],
      desconto: ['0.00', [Validators.required]],
    });
    this._margemLucro = 0;
    this.registerValueChangeListeners();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
    this.getProduct();
    this.filterProduct(this.searchText);
    this.getCurrentUser();
    this.buscarFornecedores();


  }

  incrementar() {
    this.valor++;
  }

  decrementar() {
    if (this.valor > 0) {
      this.valor--;
    }
  }


  toggleInput(product: any) {
    this.produtoAtivo = this.produtoAtivo === product ? null : product;
    this.mostrarInput = this.produtoAtivo !== null;
  }

  atualizarQuantidade(id: number | undefined, valor: number) {
    if (id === undefined || valor === 0) {
      // ID inválido ou valor igual a zero, retorna ou executa alguma ação apropriada
      return;
    }

    // Obtém o produto atual ou executa alguma ação apropriada para obter o produto

    // Verifica se é uma adição ou subtração
    const quantidadeAtual = this.produtoAtivo?.quantidade || 0;
    const novaQuantidade = quantidadeAtual + valor;

    // Atualiza a quantidade do produto
    const updateProduct: Products = {
      quantidade: novaQuantidade
    };

    this.productService.updateProductByIdShortCut(id, updateProduct).subscribe(
      (response) => {
        console.log(response);
        this.getProduct();
        this.hideUpdateQtdConfirmationAfterDelay(2500);
        this.valor = 0; // Limpa o campo de input
      },
      (error) => {
        console.log(error);
      }
    );
  }






  getLastProductCode() {
    const isProductDefault = 1; // Define o valor de is_product para produtos como true

    // @ts-ignore
    this.productService.getLastCode(isProductDefault).subscribe((response: any) => {
      if (response && response.produto && response.produto[2]) {
        this.lastProductCode = response.produto[2];
        console.log(this.lastProductCode);
      } else {
        this.lastProductCode = 'P000001';
      }
    });
  }

  generateNextCode(): string {
    const prefix = this.lastProductCode.charAt(0);
    const numericPart = parseInt(this.lastProductCode.substring(1), 10);
    const newNumericPart = numericPart + 1;
    const newFormattedCode = `${prefix}${newNumericPart.toString().padStart(6, '0')}`;

    this.formCad.get('codigo')?.setValue(newFormattedCode);

    return newFormattedCode;
  }



  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  getProduct() {
    // Ativa o sinalizador de carregamento
    this.loading = true;
    // Recupera todos os pagamentos do servidor
    this.productService.getAllProducts()
      .pipe(
        map((response: any) => response.items as Products[])
      )
      .subscribe(
        // Quando a resposta for bem-sucedida
        (products: Products[]) => {
          // Define os pagamentos recuperados na propriedade da classe
          this.products = products;
          // Desativa o sinalizador de carregamento
          this.loading = false;
          // Renderiza os pagamentos
          this.filterProduct('');
          console.log(products);
          console.log(this.currentUser);
          console.log();
        },
        // Quando ocorrer um erro na resposta
        error => {
          console.log('Houve um erro ao requisitar os produtos.');
        }
      );
  }

  filterProduct(searchValue: string) {
    searchValue = searchValue.toLowerCase();
    this.filteredProduct = this.products?.filter(
      (products) =>
        products.codigo?.toLowerCase().includes(searchValue) ||
        products.nome?.toLowerCase().includes(searchValue) ||
        products.categoria?.toString().toLowerCase().includes(searchValue) ||
        products.fornecedor_nome?.toString().toLowerCase().includes(searchValue)
    );
  }

  // Method to delete a user
  deleteProduct(id: number) {
    // Display a confirmation to the user before proceeding
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      // Make a request to delete the user with the specified ID
      this.productService.deleteProductById(id).subscribe(
        // If the request is successful, remove the user from the list and update the filtered list
        () => {
          console.log(`Produto de Código ${id} foi deletado.`);
          this.products = this.products.filter((products) => products.id !== id);
          this.filterProduct(this.searchText);
        },
        // If the request fails, display an error message in the console
        (error) => {
          console.log('An error occurred while deleting the user.');
        }
      );
    }
  }

  getCurrentUser() {
    const token = localStorage.getItem('access_token');

    try {
      if (token) {
        const decodedToken: any = jwt_decode(token);
        const user_id = decodedToken.sub.user_id;
        const level = decodedToken.sub.level;

        this.currentUser = user_id;
        this.currentLevel = level;
        console.log(this.currentUser);
        console.log(this.currentLevel);
      } else {
        console.log('Token not found in LocalStorage.');
      }
    } catch (error) {
      console.log('An error occurred while decoding the token:', error);
    }
  }

  getLevelName(levelValue: number | null): string {
    const level = this.levels.find((level) => level.value === levelValue);
    return level ? level.name : '';
  }

  calcularMargemLucro() {
    const precoCustoControl = this.formCad.get('preco_custo');
    const precoVendaControl = this.formCad.get('preco_venda');

    if (precoCustoControl && precoVendaControl && precoCustoControl.value && precoVendaControl.value) {
      const precoCusto = precoCustoControl.value;
      const precoVenda = precoVendaControl.value;

      const margemLucro = this.calculateMarginOfProfit(precoCusto, precoVenda);
      this.formCad.patchValue({ margem_lucro: margemLucro });
      console.log(margemLucro);
    }
  }


  registerValueChangeListeners() {
    const precoCustoControl = this.formCad.get('preco_custo');
    const precoVendaControl = this.formCad.get('preco_venda');

    if (precoCustoControl && precoVendaControl) {
      precoCustoControl.valueChanges.subscribe(() => this.calcularMargemLucro());
      precoVendaControl.valueChanges.subscribe(() => this.calcularMargemLucro());
    }
  }


  calculateMarginOfProfit(precoCusto: number, precoVenda: number): number {
    return ((precoVenda - precoCusto) / precoCusto) * 100;
  }


  calculateTotalValue(): number {
    const precoCusto = this.formEdit.get('preco_custo')?.value || 0;
    const desconto = this.formEdit.get('desconto')?.value || 0;
    const precoVenda = this.formEdit.get('preco_venda')?.value || 0;

    return precoVenda - (precoCusto + desconto);
  }


  formatarPrecoCusto() {
    const inputPrecoCusto = document.getElementById('preco_custo_c') as HTMLInputElement;
    const valorCusto = parseFloat(inputPrecoCusto.value).toFixed(2);
    inputPrecoCusto.value = valorCusto;
  }

  formatarPrecoVenda() {
    const inputPrecoVenda = document.getElementById('preco_venda_c') as HTMLInputElement;
    const valorVenda = parseFloat(inputPrecoVenda.value).toFixed(2);
    inputPrecoVenda.value = valorVenda;
  }


  onSubmit() {
    this.submitted = true;
    // Gerar o QR Code
    this.generateQRCodeValue();
    // Gerar o novo Código
    this.generateNextCode();

    // Se o formulário for inválido, retorne
    if (this.formCad.invalid) {
      console.log(this.formCad.invalid);
      console.log(this.formCad);
      console.log('Deu ruim 06!');
      return;
    }

    this.productService.addProduct(this.formCad.value).subscribe((newProduct) => {
      this.products.push(newProduct);
      console.log(newProduct);
      console.log(this.formCad.value);
      this.formCad.reset();

      // Redireciona para a página de consulta
      this.setActiveTab('consulta');
      this.getProduct();
      this.filterProduct(this.searchText);
      this.getCurrentUser();
      this.getProduct();
    });
  }

  public togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  formReset() {
    this.formCad.reset();
  }

  // Função para preencher os campos na aba de edição com os dados do produto selecionado
  editProduct(product: any) {
    this.selectedProduct = product;
    this.setActiveTab('edicao');
    console.log(this.selectedProduct);

    this.formEdit.patchValue({
      nome: this.selectedProduct.nome,
      codigo: this.selectedProduct.codigo,
      descricao: this.selectedProduct.descricao,
      categoria: this.selectedProduct.categoria,
      marca: this.selectedProduct.marca,
      preco_venda: this.selectedProduct.preco_venda,
      preco_custo: this.selectedProduct.preco_custo,
      margem_lucro: this.selectedProduct.margem_lucro,
      quantidade: this.selectedProduct.quantidade,
      localizacao: this.selectedProduct.localizacao,
      estoque_minimo: this.selectedProduct.estoque_minimo,
      estoque_maximo: this.selectedProduct.estoque_maximo,
      alerta_reposicao: this.selectedProduct.alerta_reposicao,
      fornecedor_id: this.selectedProduct.fornecedor_id,
      fornecedor_nome: this.selectedProduct.fornecedor_nome,
      desconto: this.selectedProduct.desconto,
    });
  }

  onUpdate() {
    const updatedProduct: Products = this.formEdit.value;
    const productId = this.selectedProduct.id;

    const confirmUpdate = confirm('Tem certeza que deseja atualizar as informações do produto?');

    if (confirmUpdate) {
      this.productService.updateProductById(productId, updatedProduct).subscribe(
        (response) => {
          console.log('Produto atualizado com sucesso', response);
          console.log(updatedProduct);
          alert('Produto atualizado com sucesso!');
          this.getProduct();
          this.setActiveTab('consulta');
        },
        (error) => {
          console.log('Erro ao atualizar o produto', error);
          console.log(updatedProduct);
          // Implemente aqui o que deve acontecer em caso de erro
        }
      );
    }
  }

  generateQRCodeValue(): string {
    const codigo = this.formCad.get('codigo')?.value;
    const nome = this.formCad.get('nome')?.value;
    const descricao = this.formCad.get('descricao')?.value;
    const quantidade = this.formCad.get('quantidade')?.value;
    const preco = this.formCad.get('preco_venda')?.value;

    const qrCodeValue = `Código: ${codigo}\nNome: ${nome}\nQuantidade: ${quantidade}\nPreço: ${preco}\n\nDescrição: ${descricao}`;
    const urlproduct: string =  `${environment.webUrl}/products/qrscan/${codigo}`

    this.formCad.get('qrcode')?.setValue(qrCodeValue);
    // Redireciona para a página "products/qrscan"
    // this.router.navigate(['products/qrscan'], { state: { urlproduct } });

    return urlproduct;
  }

  generateQRCodeValueEdit(): string {
    const codigo = this.formEdit.get('codigo')?.value;
    const nome = this.formEdit.get('nome')?.value;
    const descricao = this.formEdit.get('descricao')?.value;
    const quantidade = this.formEdit.get('quantidade')?.value;
    const preco = this.formEdit.get('preco_venda')?.value;

    const qrCodeValue = `Código: ${codigo}\nNome: ${nome}\nQuantidade: ${quantidade}\nPreço: ${preco}\n\nDescrição: ${descricao}`;
    const urlproduct: string =  `${environment.webUrl}/products/qrscan/${codigo}`

    this.formEdit.get('qrcode')?.setValue(qrCodeValue);
    // Redireciona para a página "products/qrscan"
    // this.router.navigate(['products/qrscan'], { state: { urlproduct } });

    return urlproduct;
  }

  buscarFornecedores() {
    this.suppliersService
      .getAll()
      .pipe(map((response: any) => response.items as Suppliers[]))
      .subscribe(
        (suppliers: Suppliers[]) => {
          // Mapeie apenas as propriedades necessárias (nome e id) dos fornecedores
          this.fornecedores = suppliers.map((supplier: Suppliers) => ({ id: supplier.id, nome: supplier.nome }));
          this.loading = false;
          console.log(this.fornecedores);
        },
        (error) => {
          console.log('Ocorreu um erro ao solicitar os fornecedores.');
        }
      );
  }

  scanQRCode() {
    const codigo = this.formCad.get('codigo')?.value;

    this.formCad.get('qrcode')?.setValue(codigo);

    if (this.isMobileDevice()) {
      const urlproduct: string = `${environment.webUrl}/products/qrscan/${codigo}`;

      // Redireciona para a página "products/qrscan"
      this.router.navigate(['products/qrscan'], { state: { urlproduct } });
    }
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  updateFornecedorId(event: any) {
    const nome = event.target.value;
    const fornecedor = this.fornecedores.find(f => f.nome === nome);
    if (fornecedor) {
      const fornecedorId = fornecedor.id;
      if (this.formCad) {
        this.formCad.get('fornecedor_id')?.setValue(fornecedorId);
      }
      if (this.formEdit) {
        this.formEdit.get('fornecedor_id')?.setValue(fornecedorId);
        this.formEdit.get('fornecedor_nome')?.setValue(fornecedor.nome);
      }
    }
  }

  // Função para gerar o PDF
  gerarPDF() {
    const element = this.content.nativeElement;

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgLogo = 'src/assets/on_logo.png';

      const pdfDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageOrientation: 'landscape' as PageOrientation,
        content: [
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    image: imgData,
                    width: 980,
                    margin: [-210, 0, 0, 0],
                    background: '#F2A74B' // Cor de fundo da tabela
                  }
                ]
              ]
            },
            layout: {
              defaultBorder: false
            },
            alignment: 'center',
            margin: [0, 10],
            background: '#F2D0A7' // Cor de fundo do conteúdo
          }
        ],
        background: [
          {
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: 1000,
                h: 1000,
                color: '#F2F2F2' // Cor de fundo da página inteira
              }
            ]
          }
        ]
      };

      pdfMake.createPdf(pdfDefinition).open();
    });
  }


  copyProductCode(product: Products) {
    const productCode = product.codigo; // Código do produto a copiar
    if (typeof productCode === "string") {
      navigator.clipboard.writeText(productCode)
        .then(() => {
          console.log(productCode);
          this.hideCopyConfirmationAfterDelay(2500); // Ocultar após 2,5 segundos
        })
        .catch((error) => {
          console.log(productCode);
          console.error('Erro ao copiar o código do produto:', error);
        });
    }
  }

  hideCopyConfirmationAfterDelay(delay: number) {
    const copyConfirmation = document.getElementById('copy-confirmation');
    if (copyConfirmation) {
      copyConfirmation.classList.add('show');
      setTimeout(() => {
        copyConfirmation.classList.remove('show');
      }, delay);
    }
  }

  hideUpdateQtdConfirmationAfterDelay(delay: number) {
    const UpdateQtdConfirmation = document.getElementById('qtd-shortcut-confirmation');
    if (UpdateQtdConfirmation) {
      UpdateQtdConfirmation.classList.add('show');
      setTimeout(() => {
        UpdateQtdConfirmation.classList.remove('show');
      }, delay);
    }
  }










}
