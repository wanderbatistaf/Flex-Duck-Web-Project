import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from '@app/_services';
import { map } from 'rxjs';
import { Level, User } from '@app/_models';
import jwt_decode from 'jwt-decode';
import {ActivatedRoute, Router, Params, ParamMap} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {environment} from "@environments/environment";

@Component({
  selector: 'app-employes',
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.less'],
})
export class EmployesComponent implements OnInit {
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;
  activeTab: string = 'consulta';
  loading = false;
  users: User[] = [];
  filteredUser: User[] = [];
  searchText = '';
  currentUser: number = -1;
  formCad: FormGroup;
  formEdit: FormGroup;
  lastUserId: number = 0;
  submitted = false;
  selectedUser: any;
  public passwordVisible: boolean = false;
  levels = [
    { value: 22, name: 'Admin' },
    { value: 15, name: 'Gerente' },
    { value: 10, name: 'Supervisor' },
    { value: 5, name: 'Vendedor' },
  ];
  pageSize: number = 10; // Tamanho da página (quantidade de itens por página)
  currentPage: number = 1; // Página atual
  totalItems: number = 0;
  itemsPerPage: number = 10; // Substitua pelo número de itens por página desejado
  maxPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  pages: number[] = Array.from({ length: this.maxPages }, (_, i) => i + 1);
  currentUserLvl: any;
  savingModalVisible: boolean = false;

  constructor(private usersService: UserService,
              private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute) {
    const currentDate = new Date();
    const offset = -3;
    const adjustedTimestamp = currentDate.getTime() + offset * 60 * 60 * 1000;
    const adjustedDate = new Date(adjustedTimestamp);
    const formattedCreatedAt = adjustedDate
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    this.formCad = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(1)]],
      name: ['', [Validators.required, Validators.minLength(1)]],
      password: ['', [Validators.required, Validators.minLength(1)]],
      active: [true],
      email: [''],
      created_at: [formattedCreatedAt],
      level: [''],
    });

    this.formEdit = this.fb.group({
      user_id: [''],
      username: ['', [Validators.required, Validators.minLength(1)]],
      name: ['', [Validators.required, Validators.minLength(1)]],
      password: ['', [Validators.required, Validators.minLength(1)]],
      active: [true],
      email: [''],
      created_at: [formattedCreatedAt],
      level: [''],
      last_login: [''],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');

    try {
      if (token) {
        const decodedToken: any = jwt_decode(token);
        const user_id = decodedToken.sub.user_id;
        const level = decodedToken.sub.level;
        this.currentUser = user_id;
        this.currentUserLvl = level;
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
    }

    this.filterUser(this.searchText);
    this.getCurrentUser(); // Call the method to get the current user
    const currentUrl = this.router.url; // Obtém a URL atual

    if (currentUrl.endsWith('/consulta')) {
      this.getUser();
    } else if (currentUrl.endsWith('/edicao_user')) {
      const userId = this.currentUser; // Use o currentUser obtido anteriormente
      this.setActiveTab('edicao_user');
      this.usersService.getUserById(userId).subscribe((response: any) => {
        const user = response.cliente;
        this.selectedUser = {
          user_id: user[0],
          username: user[1],
          name: user[2],
          password: user[3],
          active: user[4],
          email: user[5],
          created_at: user[6],
          level: user[8],
          last_login: user[7]
        };

        // Preenche os campos do formulário com os dados do usuário atual
        this.formEdit.patchValue({
          user_id: this.selectedUser.user_id,
          username: this.selectedUser.username,
          name: this.selectedUser.name,
          password: this.selectedUser.password,
          active: this.selectedUser.active,
          email: this.selectedUser.email,
          created_at: this.selectedUser.created_at,
          level: this.selectedUser.level,
          last_login: this.selectedUser.last_login,
        });
      });
    }
  }








  // Method to format the "created_at" field
  formatCreatedAt(): string {
    const createdAt = this.formCad.get('created_at')?.value;
    const date = new Date(createdAt);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  getUser() {
    // Activate the loading flag
    this.loading = true;
    // Retrieve all users from the server
    this.usersService
      .getAll()
      .pipe(map((response: any) => response.items as User[]))
      .subscribe(
        // When the response is successful
        (users: User[]) => {
          // Set the retrieved users to the class property
          this.users = users;

          // Set the isCurrentUser property for each user
          this.users.forEach((user) => {
            switch (user.level) {
              case 22:
                user.levelText = 'Admin';
                break;
              case 15:
                user.levelText = 'Gerente';
                break;
              case 10:
                user.levelText = 'Supervisor';
                break;
              case 5:
                user.levelText = 'Vendedor';
                break;
              default:
                user.levelText = undefined;
                break;
            }
            user.isCurrentUser = user.user_id === this.currentUser;
          });
          // Deactivate the loading flag
          this.loading = false;
          // Render the users
          this.filterUser('');
          this.totalItems = users.length;
        },
        // When an error occurs in the response
        (error) => {
          console.log('An error occurred while requesting users.');
        }
      );
  }

  filterUser(searchValue: string) {
    searchValue = searchValue.toLowerCase();
    this.filteredUser = this.users?.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchValue) ||
        user.name?.toLowerCase().includes(searchValue) ||
        user.email?.toString().toLowerCase().includes(searchValue)
    );
  }

  // Method to delete a user
  deleteUser(user_id: number) {
    // Display a confirmation to the user before proceeding
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      // Make a request to delete the user with the specified ID
      this.usersService.deleteUserById(user_id).subscribe(
        // If the request is successful, remove the user from the list and update the filtered list
        () => {
          this.savingModalVisible = true;
          this.users = this.users.filter((user) => user.user_id !== user_id);
          this.filterUser(this.searchText);
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

        this.currentUser = user_id;
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

  getLastUserId() {
    this.usersService.getLastUserId().subscribe((lastUserId) => {
      this.lastUserId = lastUserId + 1;
    });
  }

  onSubmit() {
    this.submitted = true;

    // Se o formulário for inválido, retorne
    if (this.formCad.invalid) {
      return;
    }

    this.usersService.addUser(this.formCad.value).subscribe((newUser) => {
      this.savingModalVisible = true;
      this.users.push(newUser);
      this.formCad.reset();

      // Redireciona para a página de consulta
      this.setActiveTab('consulta');
      this.getUser();
      this.filterUser(this.searchText);
      this.getCurrentUser();
      this.getUser();
    });
  }

  public togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  formReset() {
    this.formCad.reset();
  }

  // Função para preencher os campos na aba de edição com os dados do cliente selecionado
  editUser(user: any) {
    this.selectedUser = user;
    this.setActiveTab('edicao');
    this.formEdit.patchValue({
      user_id: this.selectedUser.user_id, // Use the correct property name 'user_id'
      username: this.selectedUser.username, // Use the correct property name 'username'
      name: this.selectedUser.name, // Use the correct property name 'name'
      password: this.selectedUser.password, // Use the correct property name 'password'
      active: this.selectedUser.active, // Use the correct property name 'active'
      email: this.selectedUser.email, // Use the correct property name 'email'
      created_at: this.selectedUser.created_at, // Use the correct property name 'created_at'
      level: this.selectedUser.level, // Use the correct property name 'level'
      last_login: this.selectedUser.last_login, // Use the correct property name 'last_login'
    });
  }

  redirectToHome(): void {
    this.router.navigateByUrl('/home');
  }


  onUpdate() {
    const updatedUser: User = this.formEdit.value;
    const userId = this.selectedUser.user_id;

    const confirmUpdate = confirm('Tem certeza que deseja atualizar as informações do usuário?');

    if (confirmUpdate) {
      this.usersService.updateUserById(userId, updatedUser).subscribe(
        (response) => {
          this.savingModalVisible = true;
          alert('Usuário atualizado com sucesso!');
          this.setActiveTab('consulta');
        },
        (error) => {
          console.log('Erro ao atualizar o usuário', error);
          // Implemente aqui o que deve acontecer em caso de erro
        }
      );
    }
  }

  onUpdateProfile() {
    const updatedUser: User = this.formEdit.value;
    const userId = this.selectedUser.user_id;

    const confirmUpdate = confirm('Tem certeza que deseja atualizar as informações do usuário?');

    if (confirmUpdate) {
      this.usersService.updateUserById(userId, updatedUser).subscribe(
        (response) => {
          this.savingModalVisible = true;
          alert('Usuário atualizado com sucesso!');
          this.redirectToHome();
        },
        (error) => {
          console.log('Erro ao atualizar o usuário', error);
          // Implemente aqui o que deve acontecer em caso de erro
        }
      );
    }
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

  canSelectAdminLevel(): boolean {
    // Verifica se o usuário logado tem permissão de administrador (nível 22)
    return this.currentUserLvl === 22;
  }

  canEditUser(user: User): boolean {
    const currentUserLevel = this.currentUserLvl;
    const userLevel = user.level;
    const currentUserId = this.currentUser;

    if (currentUserLevel === 22 /* Admin */) {
      return true;
    } else if (currentUserLevel === 15 /* Gerente */) {
      // Gerente pode editar supervisores (10) e vendedores (5), mas não outros gerentes (15)
      return userLevel === 10 || userLevel === 5 || user.user_id === currentUserId;
    } else if (currentUserLevel === 10 /* Supervisor */) {
      // Supervisor pode editar vendedores (5), mas não outros supervisores (10)
      return userLevel === 5 || user.user_id === currentUserId;
    } else {
      return false; // Outros níveis não podem editar ninguém
    }
  }

  canEditOrDeleteUser(user: User): boolean {
    const currentUserLevel = this.currentUserLvl; // Suponha que você já tenha essa informação
    const userLevel = user.level;

    if (currentUserLevel === 22 /* Admin */) {
      return true;
    } else if (currentUserLevel === 15 /* Gerente */) {
      // Gerente pode editar/excluir supervisores (10) e vendedores (5)
      return userLevel === 10 || userLevel === 5;
    } else if (currentUserLevel === 10 /* Supervisor */) {
      // Supervisor pode editar/excluir vendedores (5)
      return userLevel === 5;
    } else {
      return false; // Outros níveis não podem editar/excluir ninguém
    }
  }





}
