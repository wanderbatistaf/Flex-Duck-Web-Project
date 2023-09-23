import {Component, OnInit, ElementRef, ViewChild, Pipe, PipeTransform} from '@angular/core';
import {ContabilService, ProductService} from "@app/_services";
import {FormBuilder, FormGroup} from "@angular/forms";
import * as $ from 'jquery';
import 'bootstrap';

interface Produto {
  cProd: string;
  xProd: string;
  qCom: string;
  vUnCom: string;
  vProd: string;
  cfop: string;
  preco_venda: string;
  category_suggested: string;
}


@Pipe({
  name: 'filter'
})
export class FilterPipeNF implements PipeTransform {
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
  selector: 'app-notas-entrada',
  templateUrl: './notas-entrada.component.html',
  styleUrls: ['./notas-entrada.component.less']
})

export class NotasEntradaComponent implements OnInit {
  activeTab: string = 'consulta';
  @ViewChild('chNFeField', {static: false}) chNFeField!: ElementRef<HTMLInputElement>;
  @ViewChild('cUFField', {static: false}) cUFField!: ElementRef<HTMLInputElement>;
  @ViewChild('cNFField', {static: false}) cNFField!: ElementRef<HTMLInputElement>;
  @ViewChild('natOpField', {static: false}) natOpField!: ElementRef<HTMLInputElement>;
  @ViewChild('emitenteCNPJField', {static: false}) emitenteCNPJField!: ElementRef<HTMLInputElement>;
  @ViewChild('emitenteNomeField', {static: false}) emitenteNomeField!: ElementRef<HTMLInputElement>;
  @ViewChild('emitenteEnderecoField', {static: false}) emitenteEnderecoField!: ElementRef<HTMLInputElement>;
  @ViewChild('destinatarioCNPJField', {static: false}) destinatarioCNPJField!: ElementRef<HTMLInputElement>;
  @ViewChild('destinatarioCPFField', {static: false}) destinatarioCPFField!: ElementRef<HTMLInputElement>;
  @ViewChild('destinatarioNomeField', {static: false}) destinatarioNomeField!: ElementRef<HTMLInputElement>;
  @ViewChild('destinatarioEnderecoField', {static: false}) destinatarioEnderecoField!: ElementRef<HTMLInputElement>;
  @ViewChild('totalValorNFField', {static: false}) totalValorNFField!: ElementRef<HTMLInputElement>;
  @ViewChild('modFreteField', {static: false}) modFreteField!: ElementRef<HTMLInputElement>;
  @ViewChild('qVolField', {static: false}) qVolField!: ElementRef<HTMLInputElement>;
  @ViewChild('espField', {static: false}) espField!: ElementRef<HTMLInputElement>;
  @ViewChild('infAdicField', {static: false}) infAdicField!: ElementRef<HTMLInputElement>;
  @ViewChild('serieField', {static: false}) serieField!: ElementRef<HTMLInputElement>;
  @ViewChild('impostosValor', {static: false}) impostosValor!: ElementRef<HTMLInputElement>;
  @ViewChild('impostosDetalhadosField', {static: false}) impostosDetalhadosField!: ElementRef<HTMLInputElement>;
  loadingPageModalVisible: boolean = false;
  lastProductCode: string = 'P000000';
  precoVendaValue?: string;
  categoriaValue?: string;
  destinatario: string | null | undefined = '';
  itensInseridos: Produto[] = [];
  isTodosOsProdutosInseridos: boolean = false;
  private extractedData: any = {};
  savingModalVisible = false;
  loading: boolean = true;
  pesquisaNotas: string = '';
  notaSelecionada: any;
  pageSize: number = 10; // Tamanho da página (quantidade de itens por página)
  currentPage: number = 1; // Página atual
  totalItems: number = 0;
  itemsPerPage: number = 10; // Substitua pelo número de itens por página desejado
  maxPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  pages: number[] = Array.from({ length: this.maxPages }, (_, i) => i + 1);



  produtos: Produto[] = [];
  modalSelectedProduto: any = {
    preco_venda: 0
  };
  precoVendaValueMultiple?: string;
  categoriaValueMultiple?: string;
  modalProdutosMultiple: any;
  formGroup: FormGroup;
  nfnotes: any = [{mostrarChaveAcesso: false}];


  constructor( private productService: ProductService, private formBuilder: FormBuilder,
               private contabilService:ContabilService) {
    {
      this.formGroup = this.formBuilder.group({});

      // Assuming this.produtos is an array of produtos
      this.produtos.forEach((produto) => {
        // Sanitize the control name by replacing invalid characters
        const sanitizedControlName = produto.cProd.replace(/[^a-zA-Z0-9_]/g, '_');

        this.formGroup.addControl(`preco_venda_${sanitizedControlName}`, this.formBuilder.control(''));
        this.formGroup.addControl(`categoria_${sanitizedControlName}`, this.formBuilder.control(''));
      });
    }
  }

  ngOnInit(): void {
    this.loadNotasEntrada();
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // handleXmlUpload($event: Event) {
  //   const inputElement = $event.target as HTMLInputElement;
  //   const file = inputElement.files?.[0]; // Get the first selected file
  //
  //   if (file && file.type === 'text/xml') {
  //     const reader = new FileReader();
  //
  //     reader.onload = (e) => {
  //       const xmlContent = e.target?.result as string;
  //       // Aqui você pode realizar ações com o conteúdo do XML
  //       console.log('Conteúdo do XML:', xmlContent);
  //     };
  //
  //     reader.readAsText(file);
  //   } else {
  //     console.log('Por favor, selecione um arquivo XML válido.');
  //   }
  // }

  handleXmlUpload($event: Event) {
    const inputElement = $event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

    if (file && file.type === 'text/xml') {
      const reader = new FileReader();

      reader.onload = (e) => {
        const xmlContent = e.target?.result as string;
        this.parseXmlAndFillFields(xmlContent);
      };

      reader.readAsText(file);
    } else {
      console.log('Por favor, selecione um arquivo XML válido.');
    }
  }

  parseXmlAndFillFields(xmlContent: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Extrair a chave de acesso
    const chNFe = xmlDoc.querySelector('infProt chNFe')?.textContent;

    // Extrair informações do emitente
    const emitenteCNPJ = xmlDoc.querySelector('emit CNPJ')?.textContent;
    const emitenteNome = xmlDoc.querySelector('emit xNome')?.textContent;
    const emitenteEndereco = xmlDoc.querySelector('emit enderEmit xLgr')?.textContent;
    const dataEmissao = xmlDoc.querySelector('ide dhEmi')?.textContent;
    // Continue obtendo as informações de outros campos do emitente

    // Extrair informações do destinatário
    const destinatarioCNPJ = xmlDoc.querySelector('dest CNPJ')?.textContent;
    const destinatarioCPF = xmlDoc.querySelector('dest CPF')?.textContent;
    const destinatarioNome = xmlDoc.querySelector('dest xNome')?.textContent;
    const destinatarioEndereco = xmlDoc.querySelector('dest enderDest xLgr')?.textContent;


    // Verificar se o CNPJ está disponível no XML
    const cnpjDisponivel = !!destinatarioCNPJ;

    // Extrair informações do total
    const totalValorNF = xmlDoc.querySelector('total ICMSTot vNF')?.textContent;

    // Extrair informações da transportadora
    const modFrete = xmlDoc.querySelector('transp modFrete')?.textContent;
    const qVol = xmlDoc.querySelector('transp vol qVol')?.textContent;
    const esp = xmlDoc.querySelector('transp vol esp')?.textContent;
    const cUF = xmlDoc.querySelector('ide cUF')?.textContent;
    const cNF = xmlDoc.querySelector('ide cNF')?.textContent;
    const natOp = xmlDoc.querySelector('ide natOp')?.textContent;
    const serie = xmlDoc.querySelector('ide serie')?.textContent;
    const impostosTotaisElement = xmlDoc.querySelector('ICMSTot');
    const valorImpostosElement = impostosTotaisElement?.querySelector('vTotTrib');
    const vPIS = xmlDoc.querySelector('ICMSTot vPIS')?.textContent;
    const vCOFINS = xmlDoc.querySelector('ICMSTot vCOFINS')?.textContent;
    const valorImpostos = parseFloat(vPIS || '0') + parseFloat(vCOFINS || '0.00');
    const icmsValor = xmlDoc.querySelector('total ICMSTot vICMS')?.textContent || '0.00';
    const pisValor = xmlDoc.querySelector('total ICMSTot vPIS')?.textContent || '0.00';
    const cofinsValor = xmlDoc.querySelector('total ICMSTot vCOFINS')?.textContent || '0.00';

    // Criar string com valores detalhados dos impostos
    const impostosDetalhados = `ICMS: R$ ${icmsValor}\nPIS: R$ ${pisValor}\nCOFINS: R$ ${cofinsValor}`;


    // Extrair informações adicionais
    const infAdic = xmlDoc.querySelector('infAdic infCpl')?.textContent;

    // Preencher os campos com as informações extraídas
    if (this.chNFeField) {
      this.chNFeField.nativeElement.value = chNFe || '';
    }
    if (this.cUFField) {
      this.cUFField.nativeElement.value = cUF || '';
    }
    if (this.cNFField) {
      this.cNFField.nativeElement.value = cNF || '';
    }
    if (this.natOpField) {
      this.natOpField.nativeElement.value = natOp || '';
    }
    if (this.emitenteCNPJField) {
      this.emitenteCNPJField.nativeElement.value = emitenteCNPJ || '';
    }
    if (this.emitenteNomeField) {
      this.emitenteNomeField.nativeElement.value = emitenteNome || '';
    }
    if (this.emitenteEnderecoField) {
      this.emitenteEnderecoField.nativeElement.value = emitenteEndereco || '';
    }
    // Use a função cnpjOuCpfDisponivel() para decidir qual campo preencher
    if (this.destinatarioCNPJField && this.destinatarioCPFField) {
      if (cnpjDisponivel) {
        this.destinatarioCNPJField.nativeElement.value = destinatarioCNPJ || '';
      } else {
        this.destinatarioCPFField.nativeElement.value = destinatarioCPF || '';
      }
    }
    if (this.destinatarioNomeField) {
      this.destinatarioNomeField.nativeElement.value = destinatarioNome || '';
    }
    if (this.destinatarioEnderecoField) {
      this.destinatarioEnderecoField.nativeElement.value = destinatarioEndereco || '';
    }
    if (this.totalValorNFField) {
      this.totalValorNFField.nativeElement.value = totalValorNF || '';
    }

    if (this.modFreteField) {
      this.modFreteField.nativeElement.value = modFrete || '';
    }
    if (this.qVolField) {
      this.qVolField.nativeElement.value = qVol || '';
    }
    if (this.espField) {
      this.espField.nativeElement.value = esp || '';
    }
    if (this.infAdicField) {
      this.infAdicField.nativeElement.value = infAdic || '';
    }

    if (this.serieField) {
      this.serieField.nativeElement.value = serie || '';
    }

    if (this.impostosValor) {
      this.impostosValor.nativeElement.value = String(valorImpostos) || '';
    }

    if (this.impostosDetalhadosField) {
      this.impostosDetalhadosField.nativeElement.value = impostosDetalhados;
    }


    const valorDestinatario = cnpjDisponivel ? destinatarioCNPJ : destinatarioCPF;
    this.destinatario = valorDestinatario;

    // Extrair detalhes dos produtos
    const produtos: Produto[] = [];
    const detElements = xmlDoc.querySelectorAll('det');
    detElements.forEach((detElement, index) => {

      const prodElement = detElement.querySelector('prod');
      if (prodElement) {

        const produto: Produto = {
          cProd: prodElement.querySelector('cProd')?.textContent || '',
          xProd: prodElement.querySelector('xProd')?.textContent || '',
          qCom: prodElement.querySelector('qCom')?.textContent || '',
          vUnCom: prodElement.querySelector('vUnCom')?.textContent || '',
          vProd: prodElement.querySelector('vProd')?.textContent || '',
          cfop: prodElement.querySelector('CFOP')?.textContent || '',
          preco_venda: '',
          category_suggested: ''
        };
        produtos.push(produto);
      } else {
        console.log('No product element found for this DET element:', detElement);
      }
    });

    this.preencherCNPJSeVazio();

    // Preencher os campos da tabela com os detalhes dos produtos
    this.produtos = produtos;

    this.extractedData = {
      chNFe,
      cUF,
      cNF,
      natOp,
      emitenteCNPJ,
      emitenteNome,
      emitenteEndereco,
      destinatarioCNPJ,
      destinatarioCPF,
      destinatarioNome,
      destinatarioEndereco,
      modFrete,
      qVol,
      esp,
      serie,
      infAdic,
      totalValorNF,
      valorImpostos,
      impostosDetalhados,
      produtos, // Array de produtos
      dataEmissao
    };
  }

  preencherCNPJSeVazio() {
    if (!this.destinatarioCNPJField) {
      this.destinatarioCNPJField = this.destinatarioCPFField;
    }
  }

  openModal(produto: Produto) {
    this.loadingPageModalVisible = true;
    this.modalSelectedProduto = produto;
    this.getLastProductCode();
  }


  fecharModal() {
    $('#produtoModal').modal('hide');
    $('#produtoModalTodos').modal('hide');
  }

  abrirModalTodos() {
    this.loadingPageModalVisible = true;
    this.getLastProductCodeMultiple(); // Chama para obter o último código
    $('#produtoModalTodos').modal('show');
    this.loadingPageModalVisible = false;
  }

  getLastProductCode() {
    const isProductDefault = 1;

    this.productService.getLastCode(isProductDefault).subscribe((response: any) => {
      if (response && response.produto && response.produto[2]) {
        this.lastProductCode = response.produto[2];
      } else {
        this.lastProductCode = 'P000001';
      }

      if (this.modalSelectedProduto) {
        let productCodeToUse = ''; // Inicializar com um valor vazio

        this.productService.suggestPrice(this.modalSelectedProduto.xProd).subscribe((suggestResponse: any) => {

          if (suggestResponse && suggestResponse.mensagem === "Produto localizado com sucesso!") {
            if (typeof suggestResponse.suggested_price === 'number') {
              this.precoVendaValue = suggestResponse.suggested_price.toFixed(2);
            } else {
              this.precoVendaValue = '0.00';
            }

            if (suggestResponse.product_code) {
              productCodeToUse = suggestResponse.product_code; // Armazena o product_code
            } else {
              productCodeToUse = this.generateNextCode(); // Gera um novo código apenas quando não há product_code
            }
          } else {
            this.precoVendaValue = '0.00';
            productCodeToUse = this.generateNextCode(); // Gera um novo código
          }
          // Adiciona a categoria sugerida ao modalSelectedProduto
          if (suggestResponse.category_suggested) {
            this.modalSelectedProduto.category_suggested = suggestResponse.category_suggested;
            this.categoriaValue = this.modalSelectedProduto.category_suggested;
          } else {
            // Defina um valor padrão caso a categoria sugerida não seja fornecida
            this.modalSelectedProduto.category_suggested = 'Categoria';
            this.categoriaValue = this.modalSelectedProduto.category_suggested;
          }


          // Armazena o productCodeToUse no modalSelectedProduto somente para o modal
          this.modalSelectedProduto.modalCProd = productCodeToUse;

          $('#produtoModal').modal('show');
          this.loadingPageModalVisible = false;
        });
      }
    });
  }


  getLastProductCodeMultiple() {
    const isProductDefault = 1;

    this.productService.getLastCode(isProductDefault).subscribe((response: any) => {
      if (response && response.produto && response.produto[2]) {
        this.lastProductCode = response.produto[2];
      } else {
        this.lastProductCode = 'P000001';
      }

      let nextNumericPart = parseInt(this.lastProductCode.substring(1), 10);

      // Criar uma cópia dos produtos para o modal
      this.modalProdutosMultiple = this.produtos.map(produto => ({ ...produto }));

      const processNextProduct = (index: number) => {
        if (index < this.modalProdutosMultiple.length) {
          const currentProduct = this.modalProdutosMultiple[index];
          this.productService.suggestPrice(currentProduct.xProd).subscribe((suggestResponse: any) => {
            // Adicione a categoria sugerida ao produto
            if (suggestResponse.category_suggested) {
              currentProduct.category_suggested = suggestResponse.category_suggested;
            } else {
              // Defina um valor padrão para a categoria sugerida em caso de erro
              currentProduct.category_suggested = 'Categoria';
            }

            // Atualize os valores de preço de venda e categoria individualmente
            this.updatePrecoVendaAndCategoria(currentProduct, suggestResponse);

            processNextProduct(index + 1); // Processar o próximo produto
          });
        } else {
          // Todos os produtos foram processados, agora você pode exibir o modal
          $('#produtoModalTodos').modal('show');
          this.loadingPageModalVisible = false;
        }
      };

      processNextProduct(0); // Iniciar o processamento do primeiro produto
    });
  }

// Função para atualizar preço de venda e categoria de um produto individual
  private updatePrecoVendaAndCategoria(product: any, suggestResponse: any) {
    if (suggestResponse && suggestResponse.mensagem === "Produto localizado com sucesso!") {
      product.precoVenda = suggestResponse.suggested_price.toFixed(2);
    } else {
      product.precoVenda = '0.00';
    }
  }





  generateNextCode(): string {
    const prefix = this.lastProductCode.charAt(0);
    const numericPart = parseInt(this.lastProductCode.substring(1), 10);
    const newNumericPart = numericPart + 1;
    const newFormattedCode = `${prefix}${newNumericPart.toString().padStart(6, '0')}`;

    return newFormattedCode;
  }

  inserirProduto() {
    const precoVendaDigitado = (document.getElementById('preco_venda') as HTMLInputElement)?.value;
    const categoriaDigitado = (document.getElementById('categoria') as HTMLInputElement)?.value;

    // Verifica se o item já foi inserido
    if (!this.itensInseridos.some(item => item.cProd === this.modalSelectedProduto.modalCProd)) {
      // Atualiza o valor de cProd com modalCProd
      this.modalSelectedProduto.cProd = this.modalSelectedProduto.modalCProd;

      this.modalSelectedProduto.preco_venda = precoVendaDigitado;

      this.modalSelectedProduto.category_suggested = categoriaDigitado

      // Insere o item na lista de itens inseridos
      this.itensInseridos.push(this.modalSelectedProduto);
    }
    // Feche o modal ou realize outras ações necessárias
    this.loadingPageModalVisible = false;
  }


  inserirTodosOsProdutos() {
    this.modalProdutosMultiple.forEach((produto: Produto) => {
      const precoVendaInputId = `preco_venda_${produto.cProd}`;
      const categoriaInputId = `categoria_${produto.cProd}`;
      const precoVendaInput = document.getElementById(precoVendaInputId) as HTMLInputElement;
      const categoriaInput = document.getElementById(categoriaInputId) as HTMLInputElement;


      if (!this.produtoJaInserido(produto)) {
        // Verifica se o preço de venda e a categoria estão definidos
        if (precoVendaInput && categoriaInput) {
          const precoVendaDigitado = precoVendaInput.value;
          const categoriaDigitada = categoriaInput.value;

          if (precoVendaDigitado) {
            const produtoComPreco = { ...produto }; // Crie uma cópia do produto
            produtoComPreco.preco_venda = precoVendaDigitado; // Defina o preço de venda na cópia
            produtoComPreco.category_suggested = categoriaDigitada; // Defina a categoria na cópia
            this.itensInseridos.push(produtoComPreco); // Adicione a cópia à lista de itens inseridos
          } else {
            // Trate a situação em que o preço de venda não foi digitado pelo usuário
            console.error(`O preço de venda não foi digitado para o produto ${produto.cProd}.`);
          }
        } else {
          console.error(`Campo de preço de venda ou categoria não encontrado para o produto ${produto.cProd}.`);
        }
      }
    });

    // Defina isTodosOsProdutosInseridos como true após a inserção dos produtos
    this.isTodosOsProdutosInseridos = true;

    this.fecharModal()
  }


  produtoJaInserido(produto: Produto): boolean {
    return this.itensInseridos.some(p => p.cProd === produto.cProd);
  }


  limparCampos() {
    if (this.chNFeField) {
      this.chNFeField.nativeElement.value = '';
    }
    if (this.cUFField) {
      this.cUFField.nativeElement.value = '';
    }
    if (this.cNFField) {
      this.cNFField.nativeElement.value = '';
    }
    if (this.natOpField) {
      this.natOpField.nativeElement.value = '';
    }
    if (this.emitenteCNPJField) {
      this.emitenteCNPJField.nativeElement.value = '';
    }
    if (this.emitenteNomeField) {
      this.emitenteNomeField.nativeElement.value = '';
    }
    if (this.emitenteEnderecoField) {
      this.emitenteEnderecoField.nativeElement.value = '';
    }
    if (this.destinatarioCNPJField) {
      this.destinatarioCNPJField.nativeElement.value = '';
    }
    if (this.destinatarioCPFField) {
      this.destinatarioCPFField.nativeElement.value = '';
    }
    if (this.destinatarioNomeField) {
      this.destinatarioNomeField.nativeElement.value = '';
    }
    if (this.destinatarioEnderecoField) {
      this.destinatarioEnderecoField.nativeElement.value = '';
    }
    if (this.totalValorNFField) {
      this.totalValorNFField.nativeElement.value = '';
    }
    if (this.modFreteField) {
      this.modFreteField.nativeElement.value = '';
    }
    if (this.qVolField) {
      this.qVolField.nativeElement.value = '';
    }
    if (this.espField) {
      this.espField.nativeElement.value = '';
    }
    if (this.infAdicField) {
      this.infAdicField.nativeElement.value = '';
    }
    if (this.serieField) {
      this.serieField.nativeElement.value = '';
    }
    if (this.impostosValor) {
      this.impostosValor.nativeElement.value = '';
    }
    if (this.impostosDetalhadosField) {
      this.impostosDetalhadosField.nativeElement.value = '';
    }

    // Limpe os detalhes dos produtos
    this.produtos = [];

    this.formGroup.reset();

    this.destinatario = '';
    this.activeTab = 'consulta'
  }

  salvarNota() {
    this.savingModalVisible = true;

    this.contabilService.addNotes(this.extractedData, this.itensInseridos).subscribe(
      (response) => {
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
    this.limparCampos();
    this.savingModalVisible = false;
    this.activeTab = 'consulta';
  }

  loadNotasEntrada() {
    this.loading = true;
    this.contabilService.getAllNotes().subscribe(
      (data) => {
        this.nfnotes = data.items; // Assumindo que os dados são armazenados em data.items
        this.totalItems = data.length;
      },
      (error) => {
        console.error('Erro ao carregar notas de entrada:', error);
      }
    );
    this.loading = false;
  }

  toggleMostrarChaveAcesso(nota: any) {
    nota.mostrarChaveAcesso = !nota.mostrarChaveAcesso;
  }

  selecionarNota(nota: any): void {
    this.notaSelecionada = nota;
    this.notaSelecionada.produtos = JSON.parse(this.notaSelecionada.produtos);
    this.activeTab = 'cadastro'; // Ative a página de detalhes
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.maxPages) {
      this.currentPage = page;
    }
  }



  protected readonly Number = Number;
}
