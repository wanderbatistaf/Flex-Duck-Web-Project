import { Component, OnInit, ElementRef } from '@angular/core';
import { Payments } from '@app/_models';
import { PaymentsService } from '@app/_services';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-payments-list',
  templateUrl: './payments-list.component.html',
  styleUrls: ['./payments-list.component.css']
})


export class PaymentsListComponent implements OnInit {
  // Variável para armazenar o texto da busca
  searchText = '';
  
  // Variável para armazenar o pagamento em edição
  editedPayment: any;

  // Variável para indicar se a página está carregando
  loading = false;

  // Array de pagamentos
  payments: Payments[] = [];

  // Array de pagamentos filtrados
  filteredPayments: Payments[] = [];

  // Índice do pagamento em edição
  paymentEditIndex: number = -1;

  // Valor editado
  editedValue: number = 0;

  // Objeto de busca
  search = {
    username: '',
    title: '',
    date: '',
    value: '',
    isPayed: '',
    _id: ''
  };

  // Quantidade de itens por página
  itemsPerPage = 10;

  // Página atual
  cPage = 1;

  // Total de páginas
  totalPages = 100;

  // Armazena os números de cada página. Definindo o intervalo de páginas a ser exibido. 
  // Anterior [Numeral] Proximo
  pages: number[] = [];

  // Indicador se deve ser exibida uma nova linha
  showNewRow = false;

  // Formulário de edição
  myForm: FormGroup = new FormGroup({});

  // Indicador se está ocorrendo edição
  editing = false

  // Variável booleana para controlar a exibição do alert
  paymentAdded = false;

// Variável booleana para controlar a exibição do alert
  paymentEdited = false;

  constructor(private paymentService: PaymentsService, private formBuilder: FormBuilder, private elementRef: ElementRef) { }

// Executa ao inicializar o componente
  ngOnInit() {
    // Obtém os pagamentos
    this.getPayments();
    // Cria um FormGroup para manipular o formulário
    this.myForm = this.formBuilder.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      title: ['', Validators.required],
      value: ['', Validators.required],
      date: ['', Validators.required],
      isPayed: [false]
    });
    this.updatePageList();
  }

  // Define o método que recupera os pagamentos
  getPayments() {
    // Ativa o sinalizador de carregamento
    this.loading = true;
    // Recupera todos os pagamentos do servidor
    this.paymentService.getAll()
      .pipe(
        map((response: any) => response.items as Payments[])
      )
      .subscribe(
        // Quando a resposta for bem-sucedida
        (payments: Payments[]) => {
          // Define os pagamentos recuperados na propriedade da classe
          this.payments = payments;
          // Desativa o sinalizador de carregamento
          this.loading = false;
          // Renderiza os pagamentos
          this.filterPayments('');
        },
        // Quando ocorrer um erro na resposta
        error => {
          console.log('Houve um erro ao requisitar os pagamentos.');
        }
      );
  }

  // Método para buscar os pagamentos
  searchPayments() {
    // Define que a tela está carregando
    this.loading = true;
    // Chama o serviço de pagamento para obter todos os pagamentos
    this.paymentService.getAll()
    // Realiza um mapeamento para obter apenas a lista de pagamentos do response
      .pipe(
        map((response: any) => response.items as Payments[])
      )
      // Quando a requisição obtiver sucesso, executa a função de callback
      .subscribe(
        (payments: Payments[]) => {
          // Armazena os pagamentos na variável local
          this.payments = payments;
          // Define que a tela não está mais carregando
          this.loading = false;
          // Aplica os filtros de busca definidos na propriedade searchText
          this.filterPayments(this.searchText);
        },
        error => {
          // Quando a requisição obtiver erro
          console.log('Houve um erro ao requisitar os pagamentos.');
        }
      );
  }

  // Método para deletar um pagamento
  deletePayment(id: number) {
    // Exibe uma confirmação para o usuário antes de prosseguir
    if (confirm('Tem certeza que deseja excluir esse pagamento?')) {
      // Faz uma requisição para deletar o pagamento com o ID especificado
      this.paymentService.deletePaymentById(id).subscribe(
        // Se a requisição for bem-sucedida, remove o pagamento da lista e atualiza a lista filtrada
        () => {
          console.log(`Pagamento com ID ${id} foi excluído.`);
          this.payments = this.payments.filter(payment => payment._id !== id);
          this.filterPayments(this.searchText);
        },
        // Se a requisição falhar, exibe uma mensagem de erro no console
        erro => {
          console.log('Houve um erro ao excluir o pagamento.');
        }
      );
    }
  }

  filterPayments(searchValue: string) {
    // Transforma o valor digitado em minúsculo
    searchValue = searchValue.toLowerCase();

    // Filtra a lista de pagamentos de acordo com o valor digitado pelo usuário
    const filteredPayments = this.payments.filter(payment =>
      payment.username?.toLowerCase().includes(searchValue) ||
      payment.title?.toLowerCase().includes(searchValue) ||
      payment.value?.toString().toLowerCase().includes(searchValue) ||
      payment.date?.toString().toLowerCase().includes(searchValue)
    );

    // Atualiza a lista de pagamentos filtrada
    this.filteredPayments = filteredPayments;

    // Calcula o número de páginas e paginates os resultados
    this.totalPages = Math.ceil(this.filteredPayments.length / this.itemsPerPage);
    this.paginatePayments();
  }


  // Limpa o campo de busca e atualiza a lista de pagamentos
  clearSearch() {
    this.searchText = '';
    this.getPayments();
  }


  // Define a função para paginar a lista de pagamentos com base na página atual e no número de itens por página
  paginatePayments() {
    // Define o índice inicial e final da lista de pagamentos a serem exibidos com base na página atual e no número de itens por página
    const startIndex = (this.cPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Define a lista de pagamentos filtrada com base nos índices inicial e final definidos
    this.filteredPayments = this.filteredPayments.slice(startIndex, endIndex);
  }


  // Define a página atual como a página informada pelo usuário
  goToPage(page: number) {
    this.cPage = page;
    // Pagina os resultados
    this.paginatePayments();
    // Filtra os resultados de acordo com o valor de pesquisa atual
    this.filterPayments(this.searchText);
    this.updatePageList();
  }


  updatePageList() {
    this.pages = [];
    // Quantidade de paginas a serem exibidas na row
    const pagesToShow = 5;
    const halfPagesToShow = Math.floor(pagesToShow / 2);
    let startPage = this.cPage - halfPagesToShow;
    if (startPage < 1) {
      startPage = 1;
    }
    let endPage = startPage + pagesToShow - 1;
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = endPage - pagesToShow + 1;
      if (startPage < 1) {
        startPage = 1;
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }


  saveNewPayment() {
    // Define um objeto com as informações do novo pagamento a ser adicionado
    const updatePayment = {
      username: this.myForm.value.username,
      title: this.myForm.value.title,
      date: this.myForm.value.date,
      value: parseFloat(this.myForm.value.value.replace(',', '.')),
      isPayed: this.myForm.value.isPayed
    };
  
    const newPayment = {
      ...this.myForm.value,
      value: parseFloat(this.myForm.value.value.replace(',', '.')),
      firstName: this.myForm.value.username,
      lastName: this.myForm.value.title,
    };
  
    // Se existe um pagamento sendo editado, atualiza o pagamento com as informações
    if (this.editedPayment) {
      const id = this.editedPayment._id;
      this.paymentService.updatePaymentById(id, updatePayment).subscribe(() => {
        this.getPayments();
      });
    } else {
      this.paymentService.addPayment(newPayment).subscribe(() => {
        this.getPayments();
        // Define a variável paymentAdded como true após a adição de um pagamento
        this.paymentAdded = true;
        // Define um temporizador de 3 segundos e esconde o alert
        setTimeout(() => {
          this.paymentAdded = false;
        }, 2000);
      }, (error) => {
        console.log(error);
        alert('Ocorreu um erro ao adicionar o pagamento.');
      });
    }
  
    // Reinicia o formulário e esconde a linha de adição/editação de pagamento
    this.showNewRow = false;
    this.myForm.reset();
    this.editedPayment = null;
  }
  


  cancelNewPayment() {
    // Define que a linha de adição de um novo pagamento não deve mais ser exibida
    this.showNewRow = false;
    // Limpa todos os campos do formulário
    this.myForm.reset();
    // Define que nenhum pagamento está sendo editado
    this.editedPayment = null;
  }


  editPayment(payment: Payments) {
    // Busca o pagamento pelo seu ID
    this.paymentService.getPaymentById(payment._id!).subscribe(p => {
      this.editedPayment = p;
      // preencher campos do formulário com os valores do pagamento
      this.myForm.controls['username'].setValue(p.username);
      this.myForm.controls['title'].setValue(p.title);
      this.myForm.controls['date'].setValue(p.date);
      this.myForm.controls['value'].setValue(p.value);
      this.myForm.controls['isPayed'].setValue(p.isPayed);
      this.myForm.controls['firstName'].setValue(p.firstName);
      this.myForm.controls['lastName'].setValue(p.lastName);
      // exibir o formulário de edição
      this.editing = true;
    });
  }


  updatePaymentValue() {
    // define um objeto com os valores atualizados do pagamento a ser atualizado
    const updatePayment = {
      username: this.myForm.value.username,
      title: this.myForm.value.title,
      date: this.myForm.value.date,
      value: parseFloat(this.myForm.value.value.toString().replace(',', '.')),
      isPayed: this.myForm.value.isPayed,
      firstName: this.myForm.value.firstName,
      lastName: this.myForm.value.lastName
    };
  
    // exibe uma mensagem de confirmação e, se confirmado, atualiza o pagamento e seus valores
    if (confirm("Tem certeza que deseja salvar as alterações?")) {
      this.paymentService.updatePaymentById(this.editedPayment._id, updatePayment).subscribe(() => {
        // atualizar o pagamento com os novos valores
        Object.assign(this.editedPayment, updatePayment);
        // limpa o formulário e seta a edição como false
        this.myForm.reset();
        this.editedPayment = null;
        // filtra os pagamentos e atualiza a lista
        this.filterPayments(this.searchText);
        this.editing = false;
        // atualiza a lista de pagamentos
        this.getPayments()
        // Define a variável paymentAdded como true após a adição de um pagamento
        this.paymentEdited = true;
        // Define um temporizador de 3 segundos e esconde o alert
        setTimeout(() => {
          this.paymentEdited = false;
        }, 2000);
      }, (error) => {
        console.log(error);
        alert('Ocorreu um erro ao atualizar o pagamento.');
      });
    }
  }


  // Define a função showEditForm que recebe um objeto do tipo Payments como parâmetro
  showEditForm(payment: Payments) {
    // Define o pagamento que será editado
    this.editedPayment = payment;
    // Define o valor do formulário de edição com o valor do pagamento
    this.myForm.setValue({
      value: payment.value
    });
  }

  // Define a função "cancelEdit"
  cancelEdit() {
    this.editedPayment = null;
    // Reseta o formulário "myForm"
    this.myForm.reset();
  }


  applyFilters() {
    // Define que nenhum pagamento está filtrado
    this.payments.forEach(payment => payment.filtered = false);
    
    // Filtra os pagamentos de acordo com os valores da busca
    this.filteredPayments = this.payments.filter(payment => {
      return Object.keys(this.search).some(key => {
        // Se o valor da busca for nulo ou vazio, retorna todos os pagamentos
        if (!this.search[key as keyof typeof this.search]) {
          return true;
        }

        // Converte o valor da busca e o valor da propriedade do pagamento para minúsculas
        const searchValue = this.search[key as keyof typeof this.search].toString().toLowerCase();
        const prop = (payment[key as keyof typeof payment] || '').toString().toLowerCase();

        // Se a chave da busca for '_id', verifica se o ID do pagamento contém o valor da busca
        if (key === '_id') {
          return payment._id?.toString().includes(searchValue);
        // Se a chave da busca for 'isPayed', verifica se o pagamento foi pago ou não de acordo com o valor da busca
        } else if (key === 'isPayed') {
          const isPayed = prop === 'true' ? 'sim' : 'não';
          return isPayed.includes(searchValue);
        } 
        // Se a chave da busca for qualquer outra, verifica se a propriedade do pagamento contém o valor da busca
        else {
          return prop.includes(searchValue);
        }
      });
    });

    // Define que os pagamentos filtrados estão filtrados
    this.filteredPayments.forEach(payment => payment.filtered = true);
  }

}
