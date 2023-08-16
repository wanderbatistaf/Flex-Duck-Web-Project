// @ts-ignore
// @ts-ignore

import {AfterContentChecked, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {Bandeiras, Paytype, Products} from '@app/_models';
import {FuncPaymentsService, ProductService, SalesService, UserService} from '@app/_services';
import {FormBuilder} from '@angular/forms';
import {JwtHelperService} from "@auth0/angular-jwt";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {ClienteModalComponent} from "@app/modals/cliente-modal/cliente-modal.component";
import {VendedorModalComponent} from "@app/modals/vendedor-modal/vendedor-modal.component";
import {ProdutoModalComponent} from "@app/modals/produto-modal/produto-modal.component";
import {SharedService} from "@app/_services/SharedService";
import 'jspdf-autotable';
// @ts-ignore
import jsPDF from "jspdf";


interface Produto {
  codigo: string;
  nome: string;
  preco: number;
  desconto: number;
  quantidade: number;
  total: number;
}

// Add the autotable declaration
// @ts-ignore
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}


@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  providers: [SharedService] // Adicione o SharedService aos providers
})


export class SalesComponent implements OnInit, AfterContentChecked {
  @ViewChild('clienteModal') clienteModal: any;
  @ViewChild('notaFiscalContentElement', { static: true }) notaFiscalContentElement!: ElementRef;
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;
  loading = false;
  qrcode: string = ''
  products: Products[] = [];
  paytypes: any[] = [];
  bandtypes: any[] = [];
  private modalRef: NgbModalRef | undefined;
  selectedId: number | null | undefined;
  selectedVendedor: string | undefined;
  selectedClienteName: string | undefined;
  selectedClienteCPF_CNPJ!: string;
  selectedClienteTelephone!: string;
  SelectedClienteId!: string;
  listaProdutos: Produto[] = [];
  bandeiraReadonly = false;
  parcelamentoReadonly = false;
  bandeira?: string;
  parcelamento?: number;
  descontoPercent: number = 0;
  descontoValor: number = 0;
  total: number = 0;
  modalAberto = false;
  nome: string = '';
  cpfCnpj: string = '';
  telefone: string = '';
  cupomFiscalModalAberto: boolean = false;
  vendorName = ''
  ClienteName = ''
  ClienteCPF_CNPJ = ''
  SubTotal: number = 0
  Total: number = 0
  DescontoValor: number = 0
  DescontoPercent: number = 0
  Parcelamento: number = 0
  CfiscalDataHora: string | undefined;
  formaPagamento: string = '0';
  valorParcela: number = 1;
  ClienteTelephone: string = '';
  ultimoNumeroCF: number = 0;
  proximoNumeroCF: string = '000000000';
  valorPago: number = 0;
  troco: number = 0;
  loading_senhavalor = false;
  loading_senhapercent = false;
  loading_UpVenda = false;

  dadosDaVenda = {
    cliente_id: this.SelectedClienteId,
    vendedor: this.vendorName,
    cliente: this.ClienteName,
    cpf_cnpj: this.ClienteCPF_CNPJ,
    telefone: this.telefone,
    forma_pagamento_id: this.formaPagamento,
    bandeira_id: this.bandeira,
    parcelamento: this.parcelamento,
    subtotal: this.SubTotal,
    desconto: this.DescontoValor,
    valor_total: this.Total,
    valor_total_pago: this.valorPago,
    troco: (this.valorPago-this.total).toFixed(2),
    quantidade_itens: this.listaProdutos.length,
    numero_cupom_fiscal: this.proximoNumeroCF,
    imposto_estadual: 6, // Insira o valor do imposto estadual, caso possua
    imposto_federal: 10, // Insira o valor do imposto federal, caso possua
    itens_vendidos: this.listaProdutos.map(produto => ({
      produto: produto.nome,
      codigo_produto: produto.codigo,
      quantidade: produto.quantidade,
      preco_unitario: produto.preco,
      subtotal_item: Number((produto.preco * produto.quantidade).toFixed(2))
    })),
  };

  senha!: string;
  modalSenhaVisivel_val!: boolean;
  modalSenhaVisivel_perc!: boolean;

  constructor(private usersService: UserService,
              private fb: FormBuilder,
              private router: Router,
              private productService: ProductService,
              private paytypeService: FuncPaymentsService,
              private http: HttpClient,
              private formBuilder: FormBuilder,
              private modalService: NgbModal,
              private sharedService: SharedService,
              private userService: UserService,
              private salesService: SalesService) {
  }

// Executa ao inicializar o componente
  ngOnInit() {
    const token = localStorage.getItem('token');
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
    this.buscarPaytypes();
    this.buscarBandTypes();
    // Acesse os valores do Id e do Vendedor compartilhados pelo serviço
    this.selectedId = this.sharedService.selectedId;
    this.selectedVendedor = this.sharedService.selectedVendedor;
    this.onFormaPagamentoDinheiro();
    this.buscarUltimoNumeroCF();
    this.Cancelar();

  }

  ngAfterContentChecked(): void {
    // Atualizações nas variáveis vinculadas
    this.calcularTroco();
    // Outras atualizações, se houver
  }

  checkValorPago(): void {
    let formaPagamento = (document.getElementById('formaPagamento') as HTMLSelectElement).value;
    if (formaPagamento === 'Dinheiro') {
      if (this.valorPago === null || isNaN(this.valorPago)) {
        this.valorPago = 0;
      }
    }
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
        this.paytypes = paytypes.map((paytype: Paytype) => ({ id: paytype.forma_pagamento_id, nome: paytype.descricao }))
        this.loading = false;
        console.log(this.paytypes);
      },
      (error) => {
        console.log('Ocorreu um erro ao solicitar os tipos de pagamento.');
      }
    );
  }

  buscarBandTypes(){
    this.paytypeService.getAllBandsTypes().subscribe(
      (bandtypes: Bandeiras[]) => {
        this.bandtypes = bandtypes.map((bandtype: Bandeiras) => ({id: bandtype.bandeira_id, nome:bandtype.descricao}));
        this.loading = false;
      },
      (error) => {
        console.log('Ocorreu um erro ao solicitar os tipos de bandeiras.');
      }
    )
  }

  openSearchClientModal() {
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

  adicionarProduto() {
    const codigoProduto = (document.getElementById('codigoProduto') as HTMLInputElement).value;
    const quantidadeProduto = Number((document.getElementById('inputQuantidade') as HTMLInputElement).value);

    if (codigoProduto && quantidadeProduto > 0) {
      this.productService.getProductById(codigoProduto).subscribe(
        (response: any) => {
          if (response && response.produto) {
            const produto = response.produto;

            // Verifica se o valor do desconto é null ou não existe e atribui 0 se for o caso
            const desconto = produto[9] !== null && produto[9] !== undefined ? produto[9] : 0;

            const precoComDesconto = produto[6] - produto[9];
            const totalProduto = precoComDesconto * quantidadeProduto;

            const produtoAdicionado: Produto = {
              codigo: produto[1],
              nome: produto[3],
              preco: produto[6],
              desconto: desconto,
              quantidade: quantidadeProduto,
              total: totalProduto
            };

            // Verifica se o produto já está na lista
            const produtoExistente = this.listaProdutos.find(item => item.codigo === produtoAdicionado.codigo);

            if (produtoExistente) {
              // Se o produto já existe na lista, apenas incrementa a quantidade
              produtoExistente.quantidade += quantidadeProduto;
              produtoExistente.total += totalProduto;
            } else {
              // Se o produto não existe na lista, adiciona-o à lista
              this.listaProdutos.push(produtoAdicionado);
            }

            // Limpar os campos de input após adicionar o produto à lista
            (document.getElementById('codigoProduto') as HTMLInputElement).value = '';
            (document.getElementById('inputProduto') as HTMLInputElement).value = '';
            (document.getElementById('inputQuantidade') as HTMLInputElement).value = '';

            // Atualizar a lista de produtos no HTML
            this.atualizarListaProdutos();

            // Exibir o produto no console para verificar se os valores estão corretos
            console.log(produtoAdicionado);
          } else {
            console.log('Produto não encontrado');
          }
        },
        error => {
          console.log('Houve um erro ao buscar as informações do produto');
        }
      );
    }
  }


  atualizarListaProdutos() {
    // Atualizar o campo de subtotal
    const subtotalElement = document.getElementById('subtotal') as HTMLInputElement;
    if (subtotalElement) {
      subtotalElement.value = `R$ ${this.calcularSubtotal().toFixed(2)}`;
    }

    // Atualizar o campo de total
    const totalElement = document.getElementById('total') as HTMLInputElement;
    if (totalElement) {
      this.total = this.calcularTotal(); // Recalcula o total
      totalElement.value = `R$ ${this.total.toFixed(2)}`;
    }
  }

  confirmarLimparLista() {
    const confirmacao = window.confirm("Tem certeza que deseja limpar a lista de produtos?");
    if (confirmacao) {
      this.limparListaProdutos();
    }
  }

  limparListaProdutos() {
    this.listaProdutos = []; // Limpa a lista de produtos
    this.atualizarListaProdutos(); // Atualiza a lista de produtos no HTML
  }

  removerProduto(codigo: string) {
    const produtoIndex = this.listaProdutos.findIndex(produto => produto.codigo === codigo);
    if (produtoIndex !== -1) {
      if (this.listaProdutos[produtoIndex].quantidade > 1) {
        this.listaProdutos[produtoIndex].quantidade--;
        this.listaProdutos[produtoIndex].total = (this.listaProdutos[produtoIndex].preco - (this.listaProdutos[produtoIndex].preco * this.listaProdutos[produtoIndex].desconto / 100)) * this.listaProdutos[produtoIndex].quantidade;
      } else {
        this.listaProdutos.splice(produtoIndex, 1);
      }
      this.atualizarListaProdutos();
    }
  }


  // Função para adicionar mais um à quantidade de um produto na lista
  adicionarQuantidade(codigo: string) {
    const produto = this.listaProdutos.find(produto => produto.codigo === codigo);
    if (produto) {
      produto.quantidade++;
      produto.total = (produto.preco - (produto.preco * produto.desconto / 100)) * produto.quantidade;
      this.atualizarListaProdutos();
    }
  }

  calcularSubtotal(): number {
    let subtotal = 0;

    this.listaProdutos.forEach(produto => {
      subtotal += produto.preco * produto.quantidade;
    });

    return subtotal;
  }

  calcularTotal(): number {
    let total = 0;

    this.listaProdutos.forEach(produto => {
      total += produto.total;
    });

    total -= this.descontoValor; // Subtrair o valor do desconto em R$ do total final
    return total;
  }


  // Atualiza o desconto em valor com base no desconto em percentual
  atualizarDescontoPercent() {
    const subtotal = this.calcularSubtotal();

    this.descontoValor = +(subtotal * (this.descontoPercent / 100)).toFixed(2);
    this.descontoValor = Math.min(this.descontoValor, subtotal); // Garante que o desconto em R$ não ultrapasse o subtotal

    this.atualizarListaProdutos(); // Atualiza os campos de subtotal e total
  }

// Atualiza o desconto em percentual com base no desconto em valor
  atualizarDescontoValor() {
    const subtotal = this.calcularSubtotal();

    this.descontoPercent = +(this.descontoValor / subtotal * 100).toFixed(2);
    this.descontoPercent = Math.min(this.descontoPercent, 100); // Garante que o desconto em % não ultrapasse 100%

    this.atualizarListaProdutos(); // Atualiza os campos de subtotal e total
  }


  onFormaPagamentoDinheiro() {
    const formaPagamento = (document.getElementById('formaPagamento') as HTMLSelectElement).value;

    if (formaPagamento === '1') { // 1 representa a forma de pagamento "Dinheiro"
      this.bandeiraReadonly = true;
      this.parcelamentoReadonly = true;
      this.bandeira = '6'; // "6" representa "À vista"
      this.parcelamento = 1;
    } else {
      this.bandeiraReadonly = false;
      this.parcelamentoReadonly = false;
      this.bandeira = 'select'
    }
  }

  abrirModal() {
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  formatarCpfCnpj(cpfCnpj: string): string {
    // Remove todos os caracteres não numéricos
    const numeros = cpfCnpj.replace(/\D/g, '');

    // Verifica se é um CPF ou CNPJ
    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else {
      return cpfCnpj; // Retorna o valor original se não for CPF nem CNPJ válido
    }
  }

  formatarTelefone(telefone: string): string {
    // Remove todos os caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');

    // Formatação do telefone (XX) XXXXX-XXXX
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  cadastrar() {
    const dadosCadastro = {
      nome: this.nome,
      cpf_cnpj: this.cpfCnpj,
      telefone: this.telefone
    };

    // API e cadastrar os dados no banco de dados
    this.userService.addQuickClient(dadosCadastro).subscribe(
      (data: any) => {
        console.log('Cadastro realizado com sucesso:', data);
        // Limpar os campos após o cadastro
        this.nome = '';
        this.cpfCnpj = '';
        this.telefone = '';
        // Fechar o modal após o cadastro
        this.fecharModal();
      },
      error => {
        console.log('Erro ao cadastrar:', error);
      }
    );
  }

  validarCamposVenda() {
    let formaPagamento = (document.getElementById('formaPagamento') as HTMLSelectElement).value;
    let bandeira = (document.getElementById('bandeira') as HTMLSelectElement).value;
    let vendorID = (document.getElementById('inputVendedorID') as HTMLSelectElement).value;
    let vendorName = (document.getElementById('inputVendedor') as HTMLSelectElement).value;
    let ClienteName = (document.getElementById('inputCliente') as HTMLSelectElement).value;
    let ClienteCPF_CNPJ = (document.getElementById('inputCpf') as HTMLSelectElement).value;
    let ClienteTelephone = (document.getElementById('inputTelefone') as HTMLSelectElement).value;
    let SubTotal = parseFloat((document.getElementById('subtotal') as HTMLSelectElement).value.replace(/[^0-9.-]/g, ''));
    let Total = parseFloat((document.getElementById('total') as HTMLSelectElement).value.replace(/[^0-9.-]/g, ''));
    let DescontoValor = (document.getElementById('descontoValor') as HTMLSelectElement).value;
    let DescontoPercent = (document.getElementById('descontoPercent') as HTMLSelectElement).value;
    let clienteID = (document.getElementById('inputClienteID') as HTMLSelectElement).value;

    console.log(formaPagamento);

    // Lista de campos obrigatórios que precisam estar preenchidos
    let camposObrigatorios = [];
    if (!vendorID) camposObrigatorios.push('ID do vendedor');
    if (!vendorName) camposObrigatorios.push('Nome do vendedor');
    if (!ClienteName) camposObrigatorios.push('Nome do cliente');
    if (!ClienteCPF_CNPJ) camposObrigatorios.push('CPF/CNPJ do cliente');
    if (!ClienteTelephone) camposObrigatorios.push('Telefone do cliente');
    if (this.listaProdutos.length === 0) camposObrigatorios.push('Pelo menos um produto na lista');
    if (formaPagamento === '' || formaPagamento === 'select') camposObrigatorios.push('Forma de pagamento');
    if (bandeira === '' || bandeira === 'select') camposObrigatorios.push('Bandeira do cartão');

    // Verificar se todos os campos obrigatórios estão preenchidos
    if (camposObrigatorios.length === 0) {
      // Verificar o valor pago se a forma de pagamento for "Dinheiro"
      if (formaPagamento === '1') {
        let valorPagoElement = document.getElementById('valorPago') as HTMLInputElement;
        let valorPago = valorPagoElement ? parseFloat(valorPagoElement.value) : NaN;

        if (isNaN(valorPago) || valorPago <= 0) {
          // O campo "Valor Pago" não foi preenchido corretamente, exibir alerta de erro
          alert('Por favor, informe um valor válido maior que zero no campo "Valor Pago" antes de finalizar a venda.');
          return; // Retorna sem finalizar a venda
        }
        this.valorPago = valorPago;
      } else {
        this.valorPago = this.total;
      }

      // Chama o método para buscar e gerar o próximo número do CF
      this.gerarProximoNumeroCF();

      // Preencher os dados da venda antes de finalizar
      this.dadosDaVenda = {
        cliente_id: clienteID,
        vendedor: vendorName,
        cliente: ClienteName,
        cpf_cnpj: ClienteCPF_CNPJ,
        telefone: ClienteTelephone,
        forma_pagamento_id: formaPagamento,
        bandeira_id: bandeira,
        parcelamento: this.parcelamento,
        subtotal: Number(SubTotal),
        desconto: Number(DescontoValor),
        valor_total: Number(Total),
        valor_total_pago: this.valorPago,
        troco: (this.valorPago - this.total).toFixed(2),
        quantidade_itens: this.listaProdutos.length,
        numero_cupom_fiscal: this.proximoNumeroCF,
        imposto_estadual: 6, // Insira o valor do imposto estadual, caso possua
        imposto_federal: 10, // Insira o valor do imposto federal, caso possua
        itens_vendidos: this.listaProdutos.map(produto => ({
          produto: produto.nome.toString(),
          codigo_produto: produto.codigo,
          quantidade: produto.quantidade,
          preco_unitario: produto.preco,
          subtotal_item: Number((produto.preco * produto.quantidade).toFixed(2))
        })),
      };

      // Se chegou até aqui, todos os campos estão preenchidos corretamente
      // Exibir alerta de confirmação
      if (confirm('Deseja finalizar a venda?')) {
        console.log(this.dadosDaVenda);
        this.finalizarVenda();
        // this.gerarCupomFiscal();
      }
    } else {
      // Alguns campos não estão preenchidos, exibir alerta de erro com os campos obrigatórios faltantes
      let mensagemErro = 'Por favor, preencha os seguintes campos antes de finalizar a venda:\n\n';
      mensagemErro += camposObrigatorios.join('\n');
      alert(mensagemErro);
    }
  }


  abrirCupomFiscalModal() {
    this.cupomFiscalModalAberto = true;
  }

  fecharCupomFiscalModal() {
    this.cupomFiscalModalAberto = false;
  }



  gerarCupomFiscal() {
    this.formaPagamento = (document.getElementById('formaPagamento') as HTMLSelectElement).value;
    let dataAtual = new Date();
    dataAtual.setUTCHours(dataAtual.getUTCHours() - 3);


    // Formatar a data e hora no formato (DD/MM/AAAA - HH:mm:ss)
    this.CfiscalDataHora = `${dataAtual.getUTCDate().toString().padStart(2, '0')}/${
      (dataAtual.getUTCMonth() + 1).toString().padStart(2, '0')}/${
      dataAtual.getUTCFullYear()} - ${
      dataAtual.getUTCHours().toString().padStart(2, '0')}:${
      dataAtual.getUTCMinutes().toString().padStart(2, '0')}:${
      dataAtual.getUTCSeconds().toString().padStart(2, '0')}`;

    // Atualizar os valores das variáveis
    this.Total = parseFloat((document.getElementById('total') as HTMLSelectElement).value.replace(/[^0-9.-]/g, ''));
    this.DescontoValor = parseFloat((document.getElementById('descontoValor') as HTMLSelectElement).value.replace(/[^0-9.-]/g, ''));
    this.DescontoPercent = parseFloat((document.getElementById('descontoPercent') as HTMLSelectElement).value.replace(/[^0-9.-]/g, ''));
    this.Parcelamento = parseInt((document.getElementById('parcelamento') as HTMLSelectElement).value, 10);

    this.ClienteName = (document.getElementById('inputCliente') as HTMLSelectElement).value;
    this.ClienteCPF_CNPJ = (document.getElementById('inputCpf') as HTMLSelectElement).value;
    this.vendorName = (document.getElementById('inputVendedor') as HTMLSelectElement).value;
    this.SubTotal = parseFloat((document.getElementById('subtotal') as HTMLSelectElement).value.replace(/[^0-9.-]/g, ''));

    let bandeiraElement = document.getElementById('bandeira') as HTMLSelectElement;
    this.bandeira = (document.getElementById('bandeira') as HTMLSelectElement).selectedOptions[0].text;

    // Verificar se a forma de pagamento é parcelada
    if (this.parcelamento !== 0) {
      let parcelamento = this.Parcelamento;
      let total = this.calcularTotal();
      // Define o valor por parcela
      this.valorParcela = total / parcelamento
    }

    // Verificar se o desconto é zero e calcular com base no Subtotal e no Total
    if (this.DescontoPercent === 0) {
      let subtotal = this.calcularSubtotal();
      let total = this.calcularTotal();
      let descontoValor = subtotal - total;

      // Define o valor do desconto em R$ e em percentual
      this.DescontoValor = descontoValor;
      this.DescontoPercent = ((descontoValor / subtotal) * 100);
    }

    // Adicionar asterisco ao nome do produto se o desconto for maior que zero
    this.listaProdutos.forEach(produto => {
      produto.nome = produto.desconto > 0 ? produto.nome + ' *' : produto.nome;
    });

    // Show the modal
    this.abrirCupomFiscalModal();

    this.loading_UpVenda = false;
  }




  Cancelar() {
    // Redefina os valores das variáveis para limpar os campos
    this.selectedId = null;
    this.vendorName = '';
    this.ClienteName = '';
    this.ClienteCPF_CNPJ = '';
    this.ClienteTelephone = '';
    this.descontoValor = 0;
    this.descontoPercent = 0;
    this.bandeira = 'select';
    this.parcelamento = 1;
    this.valorPago = 0;
    this.total = 0;

    // Limpe a lista de produtos (se você tiver uma variável para isso)
    this.listaProdutos = [];
    this.atualizarListaProdutos();

    // Limpar os campos de input no DOM
    (document.getElementById('inputVendedorID') as HTMLInputElement).value = '';
    (document.getElementById('inputVendedor') as HTMLInputElement).value = '';
    (document.getElementById('inputCliente') as HTMLInputElement).value = '';
    (document.getElementById('inputCpf') as HTMLInputElement).value = '';
    (document.getElementById('inputTelefone') as HTMLInputElement).value = '';
    (document.getElementById('descontoValor') as HTMLInputElement).value = '0';
    (document.getElementById('descontoPercent') as HTMLInputElement).value = '0';
    (document.getElementById('bandeira') as HTMLSelectElement).selectedIndex = 0;
    (document.getElementById('formaPagamento') as HTMLSelectElement).selectedIndex = 0;
    (document.getElementById('parcelamento') as HTMLSelectElement).selectedIndex = 0;
    (document.getElementById('inputQuantidade') as HTMLInputElement).value = '';
    (document.getElementById('inputProduto') as HTMLInputElement).value = '';
    (document.getElementById('codigoProduto') as HTMLInputElement).value = '';
    (document.getElementById('descontoPercent') as HTMLInputElement).readOnly = true;
    (document.getElementById('descontoValor') as HTMLInputElement).readOnly = true;

  }



  imprimirCupom() {
    const printContents = document.getElementById('cupom-fiscal')?.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents!;
    window.print();
    document.body.innerHTML = originalContents;
  }


  gerarPdf() {
    // Montar o JSON com as informações do cupom fiscal
    const cupomFiscalData = {
      cupomFiscal: {
        numeroNF: this.proximoNumeroCF,
        CfiscalDataHora: this.CfiscalDataHora,
        vendorName: this.vendorName,
        ClienteName: this.ClienteName,
        ClienteCPF_CNPJ: this.ClienteCPF_CNPJ,
        listaProdutos: this.listaProdutos.map(produto => ({
          nome: produto.nome,
          qtd: produto.quantidade,
          preco: produto.preco,
          desconto: produto.desconto,
          total: produto.total,
        })),
        SubTotal: this.SubTotal,
        DescontoValor: this.DescontoValor,
        DescontoPercent: this.DescontoPercent,
        Total: this.Total,
        bandeira: this.bandeira,
        parcelamento: this.Parcelamento,
        valorParcela: this.valorParcela,
        valorPago: this.valorPago,
        troco: this.troco
      }
    };

    this.paytypeService.gerarPdf(cupomFiscalData).subscribe(
      (data) => {
        // Cria um blob com os dados recebidos do backend
        const blob = new Blob([data], { type: 'application/pdf' });

        // Cria um objeto URL para o blob
        const url = window.URL.createObjectURL(blob);

        // Cria um link temporário para fazer o download do PDF
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cupom-fiscal.pdf';
        link.click();

        // Libera o objeto URL e o link temporário
        window.URL.revokeObjectURL(url);
        link.remove();
      },
      (error) => {
        console.error('Erro ao gerar o PDF:', error);
      }
    );
  }

  // Método para inserir o produto na tabela
  inserirProdutoNaTabela(produto: any, quantidade: number) {
    if (produto) {
      const produtoExistente = this.listaProdutos.find((item) => item.codigo === produto[1]);

      if (produtoExistente) {
        produtoExistente.quantidade += quantidade;
        produtoExistente.total =
          (produto[6] - produto[9]) * produtoExistente.quantidade;
      } else {
        const desconto = produto[9] !== null && produto[9] !== undefined ? produto[9] : 0;
        const precoComDesconto = produto[6] - desconto;
        const totalProduto = precoComDesconto * quantidade;

        const produtoAdicionado: Produto = {
          codigo: produto[1],
          nome: produto[3],
          preco: produto[6],
          desconto: desconto,
          quantidade: quantidade,
          total: totalProduto,
        };

        this.listaProdutos.push(produtoAdicionado);
      }

      // Atualiza a lista de produtos no HTML
      this.atualizarListaProdutos();

      // Exibir o produto no console para verificar se os valores estão corretos
      console.log(this.listaProdutos);
    }
  }

  onCodigoProdutoEnter(event: any) {
    const codigoProduto = event.target.value;
    const quantidadeProduto = 1; // Defina a quantidade como 1, você pode ajustar conforme necessário

    if (codigoProduto) {
      this.productService.getProductById(codigoProduto).subscribe(
        (response: any) => {
          if (response && response.produto) {
            this.inserirProdutoNaTabela(response.produto, quantidadeProduto);
          } else {
            console.log('Produto não encontrado');
          }
        },
        (error) => {
          console.log('Houve um erro ao buscar as informações do produto');
        }
      );
    }
  }

  buscarUltimoNumeroCF() {
    this.salesService.getCFN().subscribe(
      (response: any) => {
        // Verifica se a resposta possui a propriedade "rows" e se o array "rows" não está vazio
        if (response && response.rows && response.rows.length > 0) {
          // Obtém o primeiro número do cupom fiscal do array "rows"
          this.ultimoNumeroCF = response.rows[0].numero_cupom_fiscal;
        } else {
          console.log('Não foi possível obter o número do cupom fiscal.');
        }
      },
      (error) => {
        console.log('Ocorreu um erro ao solicitar os tipos de pagamento.');
      }
    );
  }

  gerarProximoNumeroCF() {
    if (this.ultimoNumeroCF) {
      // Incrementa o número do cupom fiscal e formata para 6 dígitos (000000001 a 999999999)
      this.ultimoNumeroCF++;
      this.atualizarProximoNumeroCF(); // Chama o método para atualizar o próximo número do cupom fiscal
    }
  }

  atualizarProximoNumeroCF() {
    // Formata o próximo número do cupom fiscal para ter 9 dígitos (padLeft com '0')
    this.proximoNumeroCF = String(this.ultimoNumeroCF).padStart(9, '0');
  }

  calcularTroco(): number {
    this.Total = parseFloat((document.getElementById('total') as HTMLSelectElement).value.replace(/[^0-9.-]/g, ''));
    if (this.valorPago >= this.Total) {
      this.troco = this.valorPago - this.Total;
    } else {
      this.troco = 0; // Caso o valor pago seja menor que o total da compra, o troco será zero
    }
    return this.troco;
  }

  finalizarVenda(): void {
    this.loading_UpVenda = true;
    this.salesService.addVenda(this.dadosDaVenda).subscribe(
      (res) => {
        // Manipular a resposta do backend, se necessário
        console.log('Venda finalizada com sucesso:', res);

        // Exibir o modal com o cupom fiscal
        this.gerarCupomFiscal();
        console.log('Rodou!');
      },
      (err) => {
        console.error('Erro ao finalizar venda:', err);
      }
    );
  }

  abrirModalSenha_valor() {
    // Abre o modal de senha
    this.modalSenhaVisivel_val = true;
  }

  abrirModalSenha_percent() {
    // Abre o modal de senha
    this.modalSenhaVisivel_perc = true;
  }

  fecharModalSenha() {
    // Fecha o modal de senha e limpa o campo de senha
    this.modalSenhaVisivel_val = false;
    this.modalSenhaVisivel_perc = false;
    this.senha = '';
  }

  verificarSenha_valor() {
    this.loading_senhavalor = true;
    // Realize a verificação da senha aqui, usando a API ou lógica necessária
    // Por exemplo, chame this.userService.getUserLevelByPass(this.senha) para verificar a senha

    this.userService.getUserLevelByPass(this.senha).subscribe(
      (user) => {
        // Verifique o nível de usuário aqui
        if (user.level >= 6) {
          const descontoPercentElement = document.getElementById('descontoValor') as HTMLInputElement;
          if (descontoPercentElement) {
            descontoPercentElement.readOnly = false;
          }
        } else {
          // Faça algo se a senha estiver incorreta ou o nível do usuário for menor que 6
          alert('Você não pode adicionar um desconto.');
        }

        this.loading_senhavalor = false;

        // Fecha o modal após verificar a senha
        this.fecharModalSenha();
      },
      (error) => {
        // Trate erros aqui, como senha incorreta ou erro de conexão
        alert('Erro ao verificar a senha. Por favor, tente novamente.');
        // Fecha o modal após verificar a senha, mesmo em caso de erro
        this.fecharModalSenha();
      }
    );
  }

  verificarSenha_percent() {
    this.loading_senhapercent = true;
    // Realize a verificação da senha aqui, usando a API ou lógica necessária
    // Por exemplo, chame this.userService.getUserLevelByPass(this.senha) para verificar a senha

    this.userService.getUserLevelByPass(this.senha).subscribe(
      (user) => {
        // Verifique o nível de usuário aqui
        if (user.level >= 6) {
          // Faça algo se a senha estiver correta e o nível do usuário for maior ou igual a 6
          // Por exemplo, desbloquear o campo de desconto:
          const descontoPercentElement = document.getElementById('descontoPercent') as HTMLInputElement;
          if (descontoPercentElement) {
            descontoPercentElement.readOnly = false;
          }
        } else {
          // Faça algo se a senha estiver incorreta ou o nível do usuário for menor que 6
          alert('Você não pode adicionar um desconto.');
        }

        this.loading_senhapercent = false;

        // Fecha o modal após verificar a senha
        this.fecharModalSenha();
      },
      (error) => {
        // Trate erros aqui, como senha incorreta ou erro de conexão
        alert('Erro ao verificar a senha. Por favor, tente novamente.');
        // Fecha o modal após verificar a senha, mesmo em caso de erro
        this.fecharModalSenha();
      }
    );
  }



}
