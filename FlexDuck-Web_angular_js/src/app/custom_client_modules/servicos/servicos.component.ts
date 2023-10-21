import { AfterContentChecked, Component, ElementRef, HostListener, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {ClienteModalComponent} from "@app/modals/cliente-modal/cliente-modal.component";
import {ProductService, ServicosService, UserService} from "@app/_services";
import {SharedService} from "@app/_services/SharedService";
import {ProdutoModalComponent} from "@app/modals/produto-modal/produto-modal.component";
import {VendedorModalComponent} from "@app/modals/vendedor-modal/vendedor-modal.component";
import { map } from 'rxjs/operators';
import {Observable} from "rxjs";

@Pipe({
    name: 'filter'
})
export class FilterPipeServ implements PipeTransform {
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

interface Produto {
  codigo: string;
  nome: string;
  preco: number;
  desconto: number;
  quantidade: number;
  total: number;
}

interface Servico {
    numeroOrdem: number;
    servico: string;
    responsavel: string;
    cliente: string;
    telefone: string;
    cpf: string;
    modelo: string;
    imei: string;
    estadoAparelho: string;
    chip: string;
    cartaoMemoria: string;
    pelicula: string;
    defeitoRelatado: string;
    servicoARealizar: string;
    status: string;
    valorInicial: number;
    itens: ItemServico[];
}

interface ItemServico {
    codigo: string;
    produto: string;
    preco: number;
    desconto: number;
    quantidade: number;
    total: number;
}

export interface ApiResponse {
    lastOsCode: number[];
    mensagem: string;
}


@Component({
  selector: 'app-servicos',
  templateUrl: './servicos.component.html',
  styleUrls: ['./servicos.component.less']
})
export class ServicosComponent implements OnInit {
  @ViewChild('informacoesParaImpressao') informacoesParaImpressao?: ElementRef;
  @ViewChild('modalImpressao') modalImpressao?: ElementRef;
  @ViewChild('clienteModal') clienteModal: any;

  nome: string = '';
  cpfCnpj: string = '';
  telefone: string = '';
  selectedId?: number;
  selectedClienteName!: string;
  selectedClienteCPF_CNPJ!: string;
  selectedClienteTelephone!: string;
  SelectedClienteId!: string;
  selectedVendedor!: string;
  listaServicos: any[] = [];
  editandoStatus = false; // Variável para controlar a edição do status
  modalAberto: boolean = false;
  private modalRef: NgbModalRef | undefined;
  cpfCnpjError: boolean = false;
  listaProdutos: Produto[] = [];
  total: number = 0;
  editandoPrecoMaoDeObra: boolean = false;
  valorTotalServico: number = 0;
  totalMaodeObra = 0;
  valorInicialFormatado: string = '';
  activeTab = 'consulta';
  pesquisaServicos: string = '';
  pageSize: number = 10; // Tamanho da página (quantidade de itens por página)
  currentPage: number = 1; // Página atual
  totalItems: number = 0;
  itemsPerPage: number = 10; // Substitua pelo número de itens por página desejado
  maxPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  pages: number[] = Array.from({ length: this.maxPages }, (_, i) => i + 1);
  lastOsCode: any;

  novoServico = {
    numeroOrdem: 0,
    servico: '',
    responsavel: '',
    cliente: '',
    telefone: '',
    cpf: '',
    modelo: '',
    imei: '',
    estadoAparelho: '',
    chip: 'SIM',
    cartaoMemoria: 'SIM',
    pelicula: 'SIM',
    defeitoRelatado: '',
    servicoARealizar: '',
    status: 'Na fila',
    valorInicial: 0,
    itens: [{
        codigo: '',
        produto: '',
        preco: '',
        desconto: '',
        quantidade: '',
        total: ''
    }]
  };
  servicos: any;

  constructor(private modalService: NgbModal,private userService: UserService,
              private sharedService: SharedService, private productService: ProductService,
              private servicoService: ServicosService) { }

  ngOnInit(): void {
    this.selectedId = this.sharedService.selectedId;
    this.calcularValorTotalServico();
    this.getLastServiceCode();
    this.getAllServicos();
  }

  ngOnChanges() {
    // Quando houver alterações nas propriedades de entrada do componente, calcule o valor do serviço novamente.
    this.calcularValorTotalServico();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (this.modalRef && !this.modalRef.componentInstance.location.nativeElement.contains(event.target)) {
      this.closeModal();
    }
  }

    cadastrarServico() {
        const responsavel = (document.getElementById('inputVendedor') as HTMLInputElement).value;
        const cliente = (document.getElementById('inputCliente') as HTMLInputElement).value;
        const telefone = (document.getElementById('inputTelefone') as HTMLInputElement).value;
        const cpf = (document.getElementById('inputCpf') as HTMLInputElement).value;
        const numeroOrdem = (document.getElementById('numeroOrdem') as HTMLInputElement).value;
        const servicoName = (document.getElementById('servicoName') as HTMLInputElement).value;
        const modelo = (document.getElementById('modelo') as HTMLInputElement).value;
        const imei = (document.getElementById('imei') as HTMLInputElement).value;
        const estadoAparelho = (document.getElementById('estadoAparelho') as HTMLInputElement).value;
        const cartaoMemoria = (document.getElementById('cartaoMemoria') as HTMLInputElement).value;
        const pelicula = (document.getElementById('pelicula') as HTMLInputElement).value;
        const defeitoRelatado = (document.getElementById('defeitoRelatado') as HTMLInputElement).value;
        const servicoARealizar = (document.getElementById('servicoARealizar') as HTMLInputElement).value;
        const valorInicial = (document.getElementById('valorInicial') as HTMLInputElement).value;
        const chip = (document.getElementById('chip') as HTMLInputElement).value;

        // Crie um novo objeto para representar o serviço
        const novoServico: Servico = {
            numeroOrdem: Number(numeroOrdem),
            servico: servicoName,
            responsavel: responsavel,
            cliente: cliente,
            telefone: telefone,
            cpf: cpf,
            modelo: modelo,
            imei: imei,
            estadoAparelho: estadoAparelho,
            chip: chip,
            cartaoMemoria: cartaoMemoria,
            pelicula: pelicula,
            defeitoRelatado: defeitoRelatado,
            servicoARealizar: servicoARealizar,
            status: 'Na fila',
            valorInicial: Number(valorInicial),
            itens: []
        };

        // Itere sobre a lista de produtos e adicione os itens ao novo serviço
        for (const produto of this.listaProdutos) {
            const novoItem = {
                codigo: produto.codigo,
                produto: produto.nome,
                preco: produto.preco,
                desconto: produto.desconto,
                quantidade: produto.quantidade,
                total: produto.total
            };

            novoServico.itens.push(novoItem);
        }

        // Adicione o novo serviço à lista de serviços
        this.listaServicos.push(novoServico);

        this.servicoService.addServico(novoServico).subscribe(
            (response) => {
                console.log('Serviço salvo com sucesso:', response);
                // Redirecione ou execute ações adicionais aqui, se necessário.
            },
            (error) => {
                console.error('Erro ao salvar o serviço:', error);
                // Lide com o erro, exiba mensagens de erro ou reverta a ação, se necessário.
            }
        );

        // Imprima o JSON das informações no console
        console.log('Informações do Serviço:', JSON.stringify(novoServico, null, 2));

        this.activeTab = 'consulta';

    }


  salvarStatus(servico: any) {
    this.editandoStatus = false; // Finaliza a edição do status
  }

    atualizarStatus(servico: Servico, novoStatus: string) {
        this.servicoService.updateStatus(servico.numeroOrdem, novoStatus).subscribe(
            (response) => {
                // A resposta da API foi bem-sucedida, você pode tratar o que desejar aqui.
                console.log('Status atualizado com sucesso:', response);
                // Atualize a lista de serviços se necessário.
                this.getAllServicos();
            },
            (error) => {
                console.error('Erro ao atualizar o status do serviço:', error);
            }
        );
    }


    editarStatus(servico: any) {
    servico.editandoStatus = true; // Adiciona uma propriedade "editandoStatus" ao objeto de serviço
  }

  alternarEdicaoStatus(servico: any) {
    servico.editandoStatus = !servico.editandoStatus; // Alternar o estado de edição
  }

  imprimirServico() {
    // Prepare o conteúdo para impressão
    this.prepararParaImpressao();

    // Abra a janela de impressão do navegador
    window.print();
  }

  prepararParaImpressao() {
    // Construa o conteúdo para impressão com base nos dados do novo serviço
    const conteudoParaImpressao = `
      <h2>Informações do Serviço</h2>
      <p>Número de Ordem: ${this.novoServico.numeroOrdem}</p>
      <p>Nome do Serviço: ${this.novoServico.servico}</p>
      <p>Cliente: ${this.novoServico.cliente}</p>
      <!-- Adicione outras informações aqui -->
    `;

    // Defina o conteúdo do modal
    const modalBody = document.getElementById('conteudoParaImpressao');
    if (modalBody) {
      modalBody.innerHTML = conteudoParaImpressao;
    }
  }

  // Método para imprimir o conteúdo do modal
  imprimirConteudo() {
    this.exibirModalParaImpressao();
    window.print();
    this.ocultarModalParaImpressao();
  }

  exibirModalParaImpressao() {
    const modal = this.modalImpressao?.nativeElement;
    if (modal) {
      modal.style.display = 'block';
    }
  }

  ocultarModalParaImpressao() {
    const modal = this.modalImpressao?.nativeElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
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

  abrirModal() {
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  onCpfCnpjInput(): void {
    const cpfCnpj = this.formatarCpfCnpj(this.cpfCnpj);

    if (this.validarCpfCnpj(cpfCnpj)) {
      this.cpfCnpj = cpfCnpj;
      this.cpfCnpjError = false;
    } else {
      this.cpfCnpjError = true;
    }
  }

  formatarCpfCnpj(cpfCnpj: string): string {
    // Remove todos os caracteres não numéricos
    const numeros = cpfCnpj.replace(/\D/g, '');

    // Verifica se é um CPF ou CNPJ e formata adequadamente
    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else {
      return cpfCnpj; // Retorna o valor original se não for CPF nem CNPJ válido
    }
  }

  validarCpfCnpj(cpfCnpj: string): boolean {
    // Remove caracteres não numéricos
    const numeros = cpfCnpj.replace(/\D/g, '');

    // Valida CPF
    if (numeros.length === 11) {
      // Verifica se todos os dígitos são iguais (CPF inválido)
      if (/^(\d)\1+$/.test(numeros)) {
        return false;
      }

      // Calcula os dígitos verificadores
      let soma = 0;
      for (let i = 0; i < 9; i++) {
        soma += parseInt(numeros.charAt(i), 10) * (10 - i);
      }
      const resto = soma % 11;
      const digitoVerificador1 = resto < 2 ? 0 : 11 - resto;

      soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(numeros.charAt(i), 10) * (11 - i);
      }
      const resto2 = soma % 11;
      const digitoVerificador2 = resto2 < 2 ? 0 : 11 - resto2;

      // Verifica se os dígitos verificadores estão corretos
      if (
        parseInt(numeros.charAt(9), 10) === digitoVerificador1 &&
        parseInt(numeros.charAt(10), 10) === digitoVerificador2
      ) {
        return true; // CPF válido
      } else {
        return false; // CPF inválido
      }
    }

    // Valida CNPJ
    if (numeros.length === 14) {
      // Verifica se todos os dígitos são iguais (CNPJ inválido)
      if (/^(\d)\1+$/.test(numeros)) {
        return false;
      }

      // Calcula os dígitos verificadores
      const peso1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const peso2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

      let soma = 0;
      for (let i = 0; i < 12; i++) {
        soma += parseInt(numeros.charAt(i), 10) * peso1[i];
      }
      const digitoVerificador1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

      soma = 0;
      for (let i = 0; i < 13; i++) {
        soma += parseInt(numeros.charAt(i), 10) * peso2[i];
      }
      const digitoVerificador2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

      // Verifica se os dígitos verificadores estão corretos
      if (
        parseInt(numeros.charAt(12), 10) === digitoVerificador1 &&
        parseInt(numeros.charAt(13), 10) === digitoVerificador2
      ) {
        return true; // CNPJ válido
      } else {
        return false; // CNPJ inválido
      }
    }

    return false; // Tamanho inválido para CPF ou CNPJ
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

  formatarTelefone(telefone: string): string {
    // Remove todos os caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');

    // Formatação do telefone (XX) XXXXX-XXXX
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  onClientSelected(client: any) {
    // Atualize os campos com as informações do cliente selecionado
    this.selectedClienteName = client.nome;
    this.selectedClienteTelephone = this.formatarTelefone(client.telefone);
    this.selectedClienteCPF_CNPJ = this.formatarCpfCnpj(client.cpf_cnpj);
    this.SelectedClienteId = client.id;
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
      this.calcularValorTotalServico();

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
    this.calcularValorTotalServico();
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

    return total;
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

  adicionarMaodeObra() {
    const codigoProduto = 'S-000001'; // Código fixo para "Mão de Obra"
    const quantidadeProduto = 1; // Quantidade fixa para "Mão de Obra"

    {
      const produtoAdicionado: Produto = {
        codigo: codigoProduto,
        nome: 'Mão de Obra',
        preco: 0,
        desconto: 0, // Você pode definir o desconto fixo, se necessário
        quantidade: quantidadeProduto,
        total: this.totalMaodeObra // Total inicial é 0, você pode definir um valor se necessário
      };

      // Verifica se o produto já está na lista
      const produtoExistente = this.listaProdutos.find(item => item.codigo === produtoAdicionado.codigo);

      if (produtoExistente) {
        // Se o produto já existe na lista, apenas incrementa a quantidade
        produtoExistente.quantidade += quantidadeProduto;
        // Calcule o novo total, se necessário
        produtoExistente.total = produtoExistente.preco * produtoExistente.quantidade;
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
      this.calcularValorTotalServico();
    }
  }

  adicionarQuantidade(codigo: string) {
    const produto = this.listaProdutos.find(produto => produto.codigo === codigo);
    if (produto) {
      produto.quantidade++;
      produto.total = (produto.preco - (produto.preco * produto.desconto / 100)) * produto.quantidade;
      this.atualizarListaProdutos();
    }
  }

  isMaoDeObraInList(): boolean {
    const maoDeObra = this.listaProdutos.find(item => item.codigo === 'S-000001'); // Verifique o código "Mão de Obra"
    return !!maoDeObra; // Retornar true se "Mão de Obra" está na lista, caso contrário, retornar false
  }

  iniciarEdicaoPrecoMaoDeObra() {
    this.editandoPrecoMaoDeObra = true;
  }

  salvarPrecoMaoDeObra(novoPreco: number) {
  this.editandoPrecoMaoDeObra = false;
  this.calcularValorTotalServico();
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

  calcularValorTotalServico() {
  this.valorTotalServico = 0;

  for (const produto of this.listaProdutos) {
    this.valorTotalServico += produto.total;
  }

  // Atualize o campo "valorInicial" com o valor total do serviço
  this.novoServico.valorInicial = this.valorTotalServico;

  this.valorInicialFormatado = this.novoServico.valorInicial.toFixed(2);

      return this.valorTotalServico;
}


  atualizarPrecoMaoDeObra(produto: Produto, novoPreco: number) {
  if (produto.codigo === 'S-000001') {
    // Atualize o preço da mão de obra
    produto.preco = novoPreco;

    // Recalcule o total da mão de obra com base no novo preço
    produto.total = novoPreco;

    // Atualize o campo "valorInicial" no novoServico considerando a mão de obra
    this.novoServico.valorInicial = parseFloat(this.calcularValorTotalServico().toFixed(2));
  }
}

    cancelarServicoComConfirmacao(servico:any) {
      const confirmacao = window.confirm('Tem certeza de que deseja cancelar este serviço?');

      if (confirmacao) {
        this.atualizarStatus(servico, 'Cancelado');
      }
    }

    isTabActive(tab: string): boolean {
        return this.activeTab === tab;
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
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

    getLastServiceCode() {
        this.servicoService.getOSN().subscribe((response: any) => {
            if (response.lastOsCode) {
                this.lastOsCode = response.lastOsCode[0] + 1;

                // Atualize o valor do elemento HTML com o novo lastOsCode
                const numeroOrdemInput = (document.getElementById('numeroOrdem') as HTMLInputElement);
                if (numeroOrdemInput) {
                    numeroOrdemInput.value = this.lastOsCode.toString();
                }

                // Atualize também o valor na propriedade novoServico.numeroOrdem
                this.novoServico.numeroOrdem = this.lastOsCode;
            } else {
                this.lastOsCode = 0;
            }
        });
    }

    getAllServicos() {
        this.servicoService.getAllServicos().subscribe((data: any) => {
            this.servicos = data.items; // Obtém a lista de serviços do campo "items"
            console.log(this.servicos);
        });
    }



    protected readonly parseFloat = parseFloat;
}
