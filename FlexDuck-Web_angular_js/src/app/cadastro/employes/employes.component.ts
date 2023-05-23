import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from '@app/_services';
import { map } from 'rxjs';
import { Level, User } from '@app/_models';
import jwt_decode from 'jwt-decode';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  lastUserId: number = 0;
  submitted = false;
  public passwordVisible: boolean = false;
  levels = [
    { value: 22, name: 'Admin' },
    { value: 20, name: 'Gerente' },
    { value: 15, name: 'Supervisor' },
    { value: 10, name: 'Vendedor' },
  ];

  constructor(private usersService: UserService, private fb: FormBuilder) {
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
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
    this.getUser();
    this.filterUser(this.searchText);
    this.getCurrentUser(); // Call the method to get the current user
    this.getUser();
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
              case 20:
                user.levelText = 'Gerente';
                break;
              case 15:
                user.levelText = 'Supervisor';
                break;
              case 10:
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
          console.log(users);
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
          console.log(`Usuário de ID ${user_id} foi deletado.`);
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
        console.log(this.currentUser);
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
    console.log(this.formCad.controls);
    console.log(this.formCad.value);

    // Se o formulário for inválido, retorne
    if (this.formCad.invalid) {
      console.log('Deu ruim 06!');
      return;
    }

    this.usersService.addUser(this.formCad.value).subscribe((newUser) => {
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
}
