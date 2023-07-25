import {Component, OnInit, ViewChild, HostListener, ElementRef} from '@angular/core';
import {Bandeiras, Paytype, Products} from '@app/_models';
import {FuncPaymentsService, ProductService, UserService} from '@app/_services';
import {FormBuilder} from '@angular/forms';
import { JwtHelperService } from "@auth0/angular-jwt";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {ClienteModalComponent} from "@app/modals/cliente-modal/cliente-modal.component";
import {VendedorModalComponent} from "@app/modals/vendedor-modal/vendedor-modal.component";
import {ProdutoModalComponent} from "@app/modals/produto-modal/produto-modal.component";
import {SharedService} from "@app/_services/SharedService";


interface Produto {
  codigo: string;
  nome: string;
  preco: number;
  desconto: number;
  quantidade: number;
  total: number;
}

// Add the jQuery declaration
declare var $: any;

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  providers: [SharedService] // Adicione o SharedService aos providers
})


export class SalesComponent implements OnInit {
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

  constructor(private usersService: UserService,
              private fb: FormBuilder,
              private router: Router,
              private productService: ProductService,
              private paytypeService: FuncPaymentsService,
              private http: HttpClient,
              private formBuilder: FormBuilder,
              private modalService: NgbModal,
              private sharedService: SharedService,
              private userService: UserService) {
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
    this.Cancelar()

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
      this.bandeira = '0'; // "0" representa "À vista"
      this.parcelamento = 1;
    } else {
      this.bandeiraReadonly = false;
      this.parcelamentoReadonly = false;
      this.bandeira = 'select'
    }
  }

  solicitarSenhaPercent() {
    const senha = prompt('Digite sua senha:');
    if (senha) {
      this.userService.getUserLevelByPass(senha).subscribe(
        (user) => {
          // Verificar o nível de usuário aqui
          if (user.level >= 6) {
            const descontoPercentElement = document.getElementById('descontoPercent') as HTMLInputElement;
            if (descontoPercentElement) {
              descontoPercentElement.readOnly = false;
            }
          } else {
            const descontoPercentElement = document.getElementById('descontoPercent') as HTMLInputElement;
            if (descontoPercentElement) {
              alert('Você não pode adicionar um desconto.');
            }
          }
        },
        (error) => {
          // Tratar erros aqui, como senha incorreta ou erro de conexão
          alert('Erro ao verificar a senha. Por favor, tente novamente.');
        }
      );
    }
  }

  solicitarSenhaValor() {
    const senha = prompt('Digite sua senha:');
    if (senha) {
      this.userService.getUserLevelByPass(senha).subscribe(
        (user) => {
          // Verificar o nível de usuário aqui
          if (user.level >= 6) {
            const descontoPercentElement = document.getElementById('descontoValor') as HTMLInputElement;
            if (descontoPercentElement) {
              descontoPercentElement.readOnly = false;
            }
          } else {
            const descontoPercentElement = document.getElementById('descontoValor') as HTMLInputElement;
            if (descontoPercentElement) {
              alert('Você não pode adicionar um desconto.');
            }
          }
        },
        (error) => {
          // Tratar erros aqui, como senha incorreta ou erro de conexão
          alert('Erro ao verificar a senha. Por favor, tente novamente.');
        }
      );
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
    let SubTotal = (document.getElementById('subtotal') as HTMLSelectElement).value;
    let Total = (document.getElementById('total') as HTMLSelectElement).value;
    let DescontoValor = (document.getElementById('descontoValor') as HTMLSelectElement).value;
    let DescontoPercent = (document.getElementById('descontoPercent') as HTMLSelectElement).value;

    // Verificar se todos os campos estão preenchidos
    if (
      vendorID &&
      vendorName &&
      ClienteName &&
      ClienteCPF_CNPJ &&
      ClienteTelephone &&
      this.listaProdutos.length > 0 &&
      formaPagamento !== '' && formaPagamento !== 'select' &&
      bandeira !== 'select' && bandeira !== ''
    ) {
      // Todos os campos estão preenchidos, exibir alerta de confirmação
      if (confirm('Deseja finalizar a venda?')) {
        this.gerarCupomFiscal();
        console.log('Rodou!')
      }
    } else {
      // Alguns campos não estão preenchidos, exibir alerta de erro
      alert('Por favor, preencha todos os campos antes de finalizar a venda.');
    }
  }

  abrirCupomFiscalModal() {
    this.cupomFiscalModalAberto = true;
  }

  fecharCupomFiscalModal() {
    this.cupomFiscalModalAberto = false;
  }



  gerarCupomFiscal() {
    let formaPagamento = (document.getElementById('formaPagamento') as HTMLSelectElement).value;
    let dataAtual = new Date();
    dataAtual.setUTCHours(dataAtual.getUTCHours() - 3);

    // Formatar a data e hora no formato (DD/MM/AAAA - HH:mm:ss)
    let dataHoraFormatada = `${dataAtual.getUTCDate().toString().padStart(2, '0')}/${
      (dataAtual.getUTCMonth() + 1).toString().padStart(2, '0')}/${
      dataAtual.getUTCFullYear()} - ${
      dataAtual.getUTCHours().toString().padStart(2, '0')}:${
      dataAtual.getUTCMinutes().toString().padStart(2, '0')}:${
      dataAtual.getUTCSeconds().toString().padStart(2, '0')}`;

    this.CfiscalDataHora = dataHoraFormatada;

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
    this.bandeira = bandeiraElement.selectedOptions[0].text;

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
  }




  Cancelar() {
    // Redefina os valores das variáveis para limpar os campos
    this.selectedId = null;
    this.selectedVendedor = '';
    this.selectedClienteName = '';
    this.selectedClienteCPF_CNPJ = '';
    this.selectedClienteTelephone = '';
    this.descontoValor = 0;
    this.descontoPercent = 0;
    this.bandeira = 'select';
    this.parcelamento = 0;
    // ...

    // Limpe a lista de produtos (se você tiver uma variável para isso)
    this.listaProdutos = [];
    this.atualizarListaProdutos();
  }








  }
