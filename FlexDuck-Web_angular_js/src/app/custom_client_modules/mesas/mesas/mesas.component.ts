import {AfterContentChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {map} from "rxjs";
import {Bandeiras, Paytype, Products} from "@app/_models";
import {FuncPaymentsService, ProductService, SalesService, UserService} from "@app/_services";
import { Pipe, PipeTransform } from '@angular/core';
import {JwtHelperService} from "@auth0/angular-jwt";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {SharedService} from "@app/_services/SharedService";

interface Produto {
  codigo: string;
  nome: string;
  preco: number;
  quantidade: number;
}

interface ProdutoConsumido {
  codigo: string;
  nome: string;
  quantidade: number;
  preco: number;
}

interface Mesa {
  numero: number;
  nome: string;
  telefoneResponsavel: string;
  produtosConsumidos: Produto[];
  totalAPagar: number;
}

interface Cliente {
  nome: string;
  telefone: string;
}

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
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
  selector: 'app-mesas',
  templateUrl: './mesas.component.html',
  styleUrls: ['./mesas.component.less']
})
export class MesasComponent implements OnInit, AfterContentChecked {
  modalSenhaVisivel_val = false;
  modalSenhaVisivel_perc = false;
  modalNovaMesaVisivel = false;
  mesasAbertas: Mesa[] = [];
  mesaSelecionada: Mesa | null = null; // Mesa que está selecionada para visualizar e adicionar produtos
  senha = '';
  novoCliente: Cliente = { nome: '', telefone: '' };
  modalFinalizarMesaVisivel = false;
  subtotal = 0;
  descontoValor = 0;
  descontoPercent = 0;
  total = 0;
  modalItensConsumidosVisivel = false;
  modalAdicionarProdutoVisivel = false;
  loading!: boolean;
  produtos: Products[] = [];
  pesquisaProduto: string = '';
  produtoSelecionado: Produto | null = null;
  quantidadeProdutoAdicionar: number = 1; // Quantidade padrão ao selecionar um produto
  bandeiraReadonly!: boolean;
  parcelamentoReadonly!: boolean;
  bandeira!: string;
  parcelamento!: number;
  @ViewChild('notaFiscalContentElement', { static: true }) notaFiscalContentElement!: ElementRef;
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;
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



  constructor(private productService: ProductService,
              private userService: UserService,
              private paytypeService: FuncPaymentsService,
              private salesService: SalesService,
              private usersService: UserService,
              private fb: FormBuilder,
              private router: Router,
              private http: HttpClient,
              private formBuilder: FormBuilder,
              private modalService: NgbModal,
              private sharedService: SharedService) { }

  ngOnInit(): void {
    this.getProduct();
    this.buscarPaytypes();
    this.buscarBandTypes();
    this.onFormaPagamentoDinheiro();
    this.buscarUltimoNumeroCF();

  }

  ngAfterContentChecked(): void {
    // Atualizações nas variáveis vinculadas
    this.calcularTroco();
    // Outras atualizações, se houver
  }


  abrirNovaMesa(): void {
    // Exibir o modal para abrir uma nova mesa
    this.modalNovaMesaVisivel = true;
  }

  fecharModalNovaMesa(): void {
    // Fechar o modal para abrir uma nova mesa
    this.modalNovaMesaVisivel = false;
    this.novoCliente = { nome: '', telefone: '' };
  }

  criarNovaMesa(): void {
    // Criar a nova mesa com as informações fornecidas pelo cliente
    const numeroNovaMesa = this.mesasAbertas.length + 1;
    const novaMesa: Mesa = {
      numero: numeroNovaMesa,
      nome: this.novoCliente.nome,
      telefoneResponsavel: this.novoCliente.telefone,
      produtosConsumidos: [],
      totalAPagar: 0
    };
    this.mesasAbertas.push(novaMesa);

    // Fechar o modal após criar a nova mesa
    this.fecharModalNovaMesa();
  }

  finalizarMesaSelecionada(mesa: Mesa, abrirModal: boolean): void {
    this.mesaSelecionada = mesa;
    this.calcularSubtotal(mesa); // Atualizar o subtotal quando a mesa é selecionada
    this.calcularTotalAPagar(mesa);
    this.aplicarDesconto();

    if (abrirModal) {
      this.abrirModalFinalizarMesa();
    }
  }


  calcularTotalAPagar(mesa: Mesa): void {
    const subtotal = this.calcularSubtotal(mesa);

    if (this.descontoValor > 0) {
      mesa.totalAPagar = subtotal - this.descontoValor;
    } else if (this.descontoPercent > 0) {
      const descontoValor = (this.descontoPercent / 100) * subtotal;
      mesa.totalAPagar = subtotal - descontoValor;
    } else {
      mesa.totalAPagar = subtotal;
    }
  }

  calcularTotal(): number {
    let total = 0;

    this.mesasAbertas.forEach(mesa => {
      total += mesa.totalAPagar;
    });

    total -= this.descontoValor; // Subtrair o valor do desconto em R$ do total final
    return total;
  }


  verificarSenha_valor() {
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

  fecharModalSenha(): void {
    // Lógica para fechar o modal de senha (ao cancelar ou confirmar senha)
    this.modalSenhaVisivel_val = false;
    this.modalSenhaVisivel_perc = false;
    this.senha = '';
  }

  abrirModalSenhaValor(): void {
    // Lógica para abrir o modal de senha para adicionar valor de desconto
    this.modalSenhaVisivel_val = true;
  }

  abrirModalSenhaPercent(): void {
    this.modalSenhaVisivel_perc = true;
  }

  adicionarDescontoPercent(mesa: Mesa, descontoPercent: number): void {
    // Lógica para adicionar desconto em percentual ao total a pagar da mesa
    const descontoValor = (descontoPercent / 100) * mesa.totalAPagar;
    mesa.totalAPagar -= descontoValor;

    // Certifique-se de chamar a função calcularTotalAPagar() para aplicar o desconto corretamente
    this.calcularTotalAPagar(mesa);

    this.fecharModalSenhaPercent();
  }

  fecharModalSenhaPercent(): void {
    // Lógica para fechar o modal de senha para desconto em percentual (ao cancelar ou confirmar)
    // Implemente essa lógica de acordo com o seu modal de senha para percentual
  }

  selecionarMesa(mesa: Mesa): void {
    this.mesaSelecionada = mesa;
    this.subtotal = this.calcularSubtotal(mesa); // Atualizar o subtotal quando a mesa é selecionada
  }

  adicionarProdutoConsumido(): void {
    // Lógica para adicionar um produto consumido à mesa selecionada
    if (
      this.mesaSelecionada &&
      this.produtoSelecionado &&
      this.quantidadeProdutoAdicionar > 0
    ) {
      const produtoParaAdicionar: ProdutoConsumido = {
        codigo: this.produtoSelecionado.codigo,
        nome: this.produtoSelecionado.nome,
        quantidade: this.quantidadeProdutoAdicionar,
        preco: this.produtoSelecionado.preco,
      };

      this.mesaSelecionada.produtosConsumidos.push(produtoParaAdicionar);
      this.calcularTotalAPagar(this.mesaSelecionada);
      this.quantidadeProdutoAdicionar = 1; // Reinicia a quantidade para 1 após adicionar o produto
      this.produtoSelecionado = null; // Limpa a seleção do produto após adicionar à lista

      // Fecha o modal para adicionar o produto
      this.fecharModalAdicionarProduto();

      // Exibe mensagem no console após a adição do produto
      console.log('Produto adicionado com sucesso à mesa selecionada!');
    }
  }





  removerProdutoConsumido(index: number): void {
    // Lógica para remover um produto consumido da mesa selecionada pelo índice
    if (this.mesaSelecionada) {
      this.mesaSelecionada.produtosConsumidos.splice(index, 1);
      this.calcularTotalAPagar(this.mesaSelecionada);
    }
  }

  fecharModalFinalizarMesa(): void {
    this.modalFinalizarMesaVisivel = false;
    this.subtotal = 0;
    this.descontoValor = 0;
    this.descontoPercent = 0;
    this.total = 0;
  }

  calcularSubtotal(mesa: Mesa): number {
    let subtotal = 0;

    mesa.produtosConsumidos.forEach(produto => {
      subtotal += produto.preco * produto.quantidade;
    });

    return subtotal;
  }



  aplicarDesconto(): void {
    if (this.mesaSelecionada) {
      this.calcularTotalAPagar(this.mesaSelecionada);
      this.total = this.mesaSelecionada.totalAPagar;
    }
  }







  finalizarMesa(): void {
    if (this.mesaSelecionada) {
      // Implemente a lógica para finalizar a mesa aqui, como adicionar os produtos consumidos
      // ao backend ou realizar outras ações necessárias.
      this.mesaSelecionada = null; // Limpar a seleção da mesa para que o card não mostre o modal de produtos
    }
  }


  atualizarDescontoValor(): void {
    const subtotal = this.calcularSubtotal(this.mesaSelecionada!); // Certifique-se de que a mesa selecionada não é nula

    if (subtotal === 0) {
      this.descontoPercent = 0;
    } else {
      this.descontoPercent = +(this.descontoValor / subtotal * 100);
      this.descontoPercent = Math.min(this.descontoPercent, 100); // Garante que o desconto em % não ultrapasse 100%
    }

    this.aplicarDesconto(); // Adicione esta linha para atualizar o valor total
  }



  atualizarDescontoPercent(): void {
    const total = this.mesaSelecionada?.totalAPagar || 0; // Certifique-se de que a mesa selecionada não é nula

    this.descontoValor = +(total * (this.descontoPercent / 100));
    this.descontoValor = Math.min(this.descontoValor, total); // Garante que o desconto em R$ não ultrapasse o total

    this.aplicarDesconto(); // Adicione esta linha para atualizar o valor total
  }





  abrirModalFinalizarMesa(): void {
    this.modalFinalizarMesaVisivel = true;
    // Remova a chamada para calcularSubtotal e aplicarDesconto aqui, pois já foram feitas no finalizarMesaSelecionada
  }

  fecharModalProdutosConsumidos(): void {
    this.modalItensConsumidosVisivel = false;
    this.mesaSelecionada = null;
  }

  abrirModalProdutosConsumidos(mesa: Mesa): void {
    this.mesaSelecionada = mesa;
    this.modalItensConsumidosVisivel = true;
  }

  abrirModalAdicionarProduto(mesa: Mesa): void {
    this.modalItensConsumidosVisivel = false;
    this.mesaSelecionada = mesa;
    this.modalAdicionarProdutoVisivel = true;
  }

  fecharModalAdicionarProduto(): void {
    this.modalAdicionarProdutoVisivel = false;
    this.mesaSelecionada = null;
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
          this.produtos = produtos.map((produto: Products) => ({
            ...produto,
            preco: Number(produto.preco_venda), // Converte o preço para número
          }));
          this.loading = false;
          console.log(this.produtos);
        },
        // Quando ocorrer um erro na resposta
        error => {
          console.log('Houve um erro ao requisitar os produtos.');
        }
      );
  }

  selecionarProduto(produto: Produto): void {
    this.produtoSelecionado = produto;
  }

  perguntarQuantidade(produto: Produto): void {
    this.produtoSelecionado = produto;
    this.quantidadeProdutoAdicionar = 1; // Define a quantidade padrão para 1 após selecionar o produto
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

  checkValorPago(): void {
    let formaPagamento = (document.getElementById('formaPagamento') as HTMLSelectElement).value;
    if (formaPagamento === 'Dinheiro') {
      if (this.valorPago === null || isNaN(this.valorPago)) {
        this.valorPago = 0;
      }
    }
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

  finalizarVenda(): void {
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
      let subtotal = this.calcularSubtotal(this.mesaSelecionada!);
      let total = this.calcularTotal();
      let descontoValor = subtotal - total;

      // Define o valor do desconto em R$ e em percentual
      this.DescontoValor = descontoValor;
      this.DescontoPercent = ((descontoValor / subtotal) * 100);
    };

    // Show the modal
    this.abrirCupomFiscalModal();
  }

  abrirCupomFiscalModal() {
    this.cupomFiscalModalAberto = true;
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



}
