import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from '@app/_services';
import { map } from 'rxjs';
import { User } from '@app/_models';
import jwt_decode from 'jwt-decode';

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

  constructor(private usersService: UserService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
    this.getUser();
    this.filterUser(this.searchText);
    this.getCurrentUser(); // Chame o método para obter o usuário atual
    this.getUser();
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getUser() {
    // Ativa o sinalizador de carregamento
    this.loading = true;
    // Recupera todos os usuários do servidor
    this.usersService
      .getAll()
      .pipe(map((response: any) => response.items as User[]))
      .subscribe(
        // Quando a resposta for bem-sucedida
        (users: User[]) => {
          // Define os usuários recuperados na propriedade da classe
          this.users = users;

          // Definir a propriedade isCurrentUser para cada usuário
          this.users.forEach((user) => {
            user.isCurrentUser = user.user_id === this.currentUser;
          });
          // Desativa o sinalizador de carregamento
          this.loading = false;
          // Renderiza os usuários
          this.filterUser('');
          console.log(users);
        },
        // Quando ocorrer um erro na resposta
        (error) => {
          console.log('Houve um erro ao requisitar os usuários.');
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

  // Método para deletar um usere
  deleteUser(user_id: number) {
    // Exibe uma confirmação para o usuário antes de prosseguir
    if (confirm('Tem certeza que deseja excluir esse usuário?')) {
      // Faz uma requisição para deletar o usere com o ID especificado
      this.usersService.deleteUserById(user_id).subscribe(
        // Se a requisição for bem-sucedida, remove o usere da lista e atualiza a lista filtrada
        () => {
          console.log(`Usuário com ID ${user_id} foi excluído.`);
          this.users = this.users.filter((users) => users.user_id !== user_id);
          this.filterUser(this.searchText);
        },
        // Se a requisição falhar, exibe uma mensagem de erro no console
        (erro) => {
          console.log('Houve um erro ao excluir o usuário.');
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
        console.log(this.currentUser);
      } else {
        console.log('Token não encontrado no LocalStorage.');
      }
    } catch (error) {
      console.log('Houve um erro ao decodificar o token:', error);
    }
  }
}
  

