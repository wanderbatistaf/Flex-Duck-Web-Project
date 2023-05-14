import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";
import { Clients } from "@app/_models/clients";
import { ClientsService } from "@app/_services";
import { ViaCepService } from "@app/_services";
import { map } from 'rxjs/operators';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;
  // Variável para indicar se a página está carregando
  loading = false;
  // Array de clientes
  clients: Clients[] = [];
  // Array de pagamentos filtrados
  filteredClients: Clients[] = [];
  // Quantidade de itens por página
  itemsPerPage = 10;
  // Página atual
  cPage = 1;
  // Total de páginas
  totalPages = 100;
  // Armazena os números de cada página. Definindo o intervalo de páginas a ser exibido.
  // Anterior [Numeral] Proximo
  pages: number[] = [];
  // Variável para armazenar o texto da busca
  searchText = '';
  // Variável para armazenar o cliente em edição
  editedClients: any;
  // Variavel para armazenar a tab ativa
  activeTab: string = 'consulta';
  // Variavel de checagem pessoa Fisica
  formCad: FormGroup;
  // Variavel de grupo de edição
  formEdit: FormGroup;
  // Mascaras do formulario
  public cpfMask = [/[0-9]/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  public phoneMask = ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public zipCodeMask = [/[0-9]/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];
  // Paterns
  cpfPattern = /^\d{3}.\d{3}.\d{3}-\d{2}$/;
  phonePattern = /^\(\d{2}\) \d{5}-\d{4}$/;
  zipCodePattern = /^\d{5}\-\d{3}$/;
  // Variavel de genero
  genders = ['Masculino', 'Feminino'];
  // VAR 1
  submitted = false;
  // Muda para a aba Edição
  selectedTab: string = 'consulta';


  constructor(private clientsService: ClientsService,
              private fb: FormBuilder,
              private changeDetectorRef: ChangeDetectorRef,
              private viaCepService: ViaCepService,
              private router: Router) {
    const currentDateTimestamp = Math.floor(Date.now() / 1000);


    this.formCad = this.fb.group({
      business_name: [''],
      firstname: ['', [Validators.required, Validators.minLength(1)]],
      lastname: ['', [Validators.required, Validators.minLength(1)]],
      cnpj_cpf: ['', [Validators.required, Validators.pattern(this.cpfPattern)]],
      state_registration: [''],
      municipal_registration: [''],
      telephone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      email: [''],
      inactive_status: [false],
      blocked_status: [false],
      natural_person: [false],
      city: [''],
      street: [''],
      district: [''],
      state: [''],
      number: [''],
      complement: [''],
      gender: [''],
      cep: ['', [Validators.pattern(this.zipCodePattern)]],
      created_at: currentDateTimestamp,
      inactive_since: null,
      blocked_since: null
    });

    this.formEdit = this.fb.group({
      business_name: [''],
      firstname: ['', [Validators.required, Validators.minLength(1)]],
      lastname: ['', [Validators.required, Validators.minLength(1)]],
      cnpj_cpf: ['', [Validators.required, Validators.pattern(this.cpfPattern)]],
      state_registration: [''],
      municipal_registration: [''],
      telephone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      email: [''],
      inactive_status: [false],
      blocked_status: [false],
      natural_person: [false],
      city: [''],
      street: [''],
      district: [''],
      state: [''],
      number: [''],
      complement: [''],
      gender: [''],
      cep: ['', [Validators.pattern(this.zipCodePattern)]],
      created_at: currentDateTimestamp,
      inactive_since: null,
      blocked_since: null
    });

  }


  ngOnInit(): void {
    const token = localStorage.getItem('token')
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
    this.formCad.controls['natural_person'].valueChanges.subscribe(value => {
      // Atualizar a visibilidade dos campos
      if (value) {
        this.formCad.controls['state_registration'].disable();
        this.formCad.controls['municipal_registration'].disable();
        this.formCad.controls['business_name'].disable();
      } else {
        this.formCad.controls['state_registration'].enable();
        this.formCad.controls['municipal_registration'].enable();
        this.formCad.controls['business_name'].enable();
      }
      this.changeDetectorRef.detectChanges();
    });
    this.getClients();
    this.updatePageList();
    this.clients = [];
    this.formCad.controls['natural_person'].setValue(true); // definindo pessoaFisica como true
    this.changeDetectorRef.detectChanges();
    setTimeout(() => { // aguardando 1 segundo antes de definir como false
      this.formCad.controls['natural_person'].setValue(false);
    }, 1000);
    this.changeDetectorRef.detectChanges();
  };



  // Define a função para paginar a lista de pagamentos com base na página atual e no número de itens por página
  paginateClients() {
    // Define o índice inicial e final da lista de pagamentos a serem exibidos com base na página atual e no número de itens por página
    const startIndex = (this.cPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Define a lista de clientes filtrada com base nos índices inicial e final definidos
    this.filteredClients = this.clients.slice(startIndex, endIndex);
  }


  // Define a página atual como a página informada pelo usuário
  goToPage(page: number) {
    this.cPage = page;
    // Pagina os resultados
    this.paginateClients();
    // Filtra os resultados de acordo com o valor de pesquisa atual
    this.filterClients(this.searchText);
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


  // Define o método que recupera os clientes
  getClients() {
    // Ativa o sinalizador de carregamento
    this.loading = true;
    // Recupera todos os pagamentos do servidor
    this.clientsService.getAll()
      .pipe(
        map((response: any) => response.items as Clients[])
      )
      .subscribe(
        // Quando a resposta for bem-sucedida
        (clients: Clients[]) => {
          // Define os pagamentos recuperados na propriedade da classe
          this.clients = clients;
          // Desativa o sinalizador de carregamento
          this.loading = false;
          // Exibindo no console
          console.log(clients);
          // Renderiza os pagamentos
          this.filterClients('');
        },
        // Quando ocorrer um erro na resposta
        error => {
          console.log('Houve um erro ao requisitar os clientes.');
        }
      );
  }


  filterClients(searchValue: string): void {
    // Transforma o valor digitado em minúsculo
    searchValue = searchValue.toLowerCase();

    // Filtra a lista de clientes de acordo com o valor digitado pelo usuário
    const filteredClients = this.clients?.filter(client =>
      client.business_name?.toLowerCase().includes(searchValue) ||
      client.firstname?.toLowerCase().includes(searchValue) ||
      client.lastname?.toLowerCase().includes(searchValue) ||
      client.cnpj_cpf?.toLowerCase().includes(searchValue) ||
      client.state_registration?.toString().includes(searchValue) ||
      client.municipal_registration?.toString().includes(searchValue) ||
      client.telephone?.toString().includes(searchValue) ||
      client.email?.toLowerCase().includes(searchValue) ||
      client.created_at?.toTimeString().includes(searchValue) ||
      client.inactive_since?.toString().includes(searchValue) ||
      client.blocked_since?.toTimeString().includes(searchValue) ||
      client.cep?.toString().includes(searchValue) ||
      client.street?.toString().includes(searchValue) ||
      client.district?.toString().includes(searchValue) ||
      client.city?.toString().includes(searchValue) ||
      client.state?.toString().includes(searchValue) ||
      client.natural_person?.toString().includes(searchValue) ||
      client.inactive_status?.toString().includes(searchValue) ||
      client.blocked_status?.toString().includes(searchValue)
    );
    // Define a lista filtrada na propriedade da classe
    this.filteredClients = filteredClients;

    // Atualiza a lista de clientes filtrada
    this.filteredClients = filteredClients;

    // Calcula o número de páginas e paginates os resultados
    this.totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
    this.paginateClients();
  }


  // Método para deletar um cliente
  deleteClient(id: number) {
    // Exibe uma confirmação para o usuário antes de prosseguir
    if (confirm('Tem certeza que deseja excluir esse cliente?')) {
      // Faz uma requisição para deletar o cliente com o ID especificado
      this.clientsService.deleteClientById(id).subscribe(
        // Se a requisição for bem-sucedida, remove o cliente da lista e atualiza a lista filtrada
        () => {
          console.log(`Cliente com ID ${id} foi excluído.`);
          this.clients = this.clients.filter(clients => clients.client_id !== id);
          this.filterClients(this.searchText);
        },
        // Se a requisição falhar, exibe uma mensagem de erro no console
        erro => {
          console.log('Houve um erro ao excluir o cliente.');
        }
      );
    }
  }

  clearSearch() {
    this.searchText = '';
    this.getClients();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }


  togglePessoaFisica() {
    if (this.formCad.controls['pessoaFisica'].value) {
      this.formCad.controls['cnpjCpf'].setValidators([]);
      this.formCad.controls['inscricaoEstadual'].setValidators([]);
      this.formCad.controls['inscricaoMunicipal'].setValidators([]);
    } else {
      this.formCad.controls['cnpjCpf'].setValidators([Validators.required]);
      this.formCad.controls['inscricaoEstadual'].setValidators([Validators.required]);
      this.formCad.controls['inscricaoMunicipal'].setValidators([]);
    }

    this.formCad.controls['cnpjCpf'].updateValueAndValidity();
    this.formCad.controls['inscricaoEstadual'].updateValueAndValidity();
    this.formCad.controls['inscricaoMunicipal'].updateValueAndValidity();
  }

  formReset() {
    this.formCad.reset();
  }


  searchZipCode(cep: string) {
    cep = cep.replace(/\D/g, '');
    if (cep !== '') {
      const cepValidate = /^[0-9]{8}$/;
      if (cepValidate.test(cep)) {
        this.viaCepService.getAddress(cep).subscribe(
          res => {
            console.log(res); // adiciona essa linha para imprimir a resposta no console
            if (!(res.hasOwnProperty('erro'))) {
              this.populateAddress(res);
              this.formCad.controls['cep'].setErrors(null);
            } else {
              this.formCad.controls['cep'].setErrors({ 'incorrect': true });
            }
          },
          error => {
            console.log(`Error: ${error}`);
          }
        );
      }
    }
  }


  populateAddress(res: any) {
    this.formCad.controls['street'].setValue(res.logradouro);
    this.formCad.controls['district'].setValue(res.bairro);
    this.formCad.controls['city'].setValue(res.localidade);
    this.formCad.controls['state'].setValue(res.uf);
  }

  get f() { return this.formCad.controls; }

  onSubmit() {
    this.submitted = true;
    console.log(this.formCad.controls);
    console.log(this.formCad.value);

    // Para aqui se o formulário for inválido
    if (this.formCad.invalid) {
      console.log("Deu ruim 06!")
      return;
    }

    this.clientsService.addClient(this.formCad.value).subscribe(newClient => {
      this.clients.push(newClient);
      this.formCad.reset();
    });
  }

  atualizarMascara() {
    const pessoaFisica = this.formCad.controls['natural_person'].value;
    if (pessoaFisica) {
      this.cpfMask = [/[0-9]/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
    } else {
      this.cpfMask = [/[0-9]/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
    }
  }

  checkError(field:any) {
    return {
      'has-danger': this.touchedVerify(field)
    };
  }

  touchedVerify(field:any) {
    return !this.formCad.get(field)?.valid && this.formCad.get(field)?.touched;
  }

  // Variável para armazenar os dados do cliente selecionado para edição
  selectedClient: any;

// Função para preencher os campos na aba de edição com os dados do cliente selecionado
  editClients(client: any) {
    this.selectedClient = client;
    this.setActiveTab('edicao');
    console.log(this.selectedClient);

    this.formEdit.patchValue({
      business_name: this.selectedClient.business_name,
      firstname: this.selectedClient.firstname,
      lastname: this.selectedClient.lastname,
      cnpj_cpf: this.selectedClient.cnpj_cpf,
      state_registration: this.selectedClient.state_registration,
      municipal_registration: this.selectedClient.municipal_registration,
      telephone: this.selectedClient.telephone,
      email: this.selectedClient.email,
      inactive_status: this.selectedClient.inactive_status,
      blocked_status: this.selectedClient.blocked_status,
      natural_person: this.selectedClient.natural_person,
      city: this.selectedClient.city,
      street: this.selectedClient.street,
      district: this.selectedClient.district,
      state: this.selectedClient.state,
      number: this.selectedClient.number,
      complement: this.selectedClient.complement,
      gender: this.selectedClient.gender,
      cep: this.selectedClient.cep,
      created_at: this.selectedClient.created_at,
      inactive_since: this.selectedClient.inactive_since,
      blocked_since: this.selectedClient.blocked_since
    });
  }

  onUpdate() {
    const updatedClient: Clients = this.formEdit.value;
    const clientId = this.selectedClient.client_id;

    // Exibe um alerta de confirmação
    const confirmUpdate = confirm('Tem certeza que deseja atualizar as informações do cliente?');

    if (confirmUpdate) {
      this.clientsService.updateClientById(clientId, updatedClient).subscribe(
        (response) => {
          console.log('Cliente atualizado com sucesso', response);
          console.log(updatedClient);
          // Redireciona para a aba de consulta
          this.router.navigate(['/clients']);
          this.activeTab = 'consulta';
        },
        (error) => {
          console.log('Erro ao atualizar o cliente', error);
          console.log(updatedClient);
          // Implemente aqui o que deve acontecer em caso de erro
        }
      );
    }




  }







}
