import { Component } from '@angular/core';

import { AuthenticationService } from '@app/_services';
import { User } from '@app/_models';
import { Level } from '@app/_models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  user?: User | null;
  isCadastroMenuOpen = false;
  isInterfaceMenuOpen = false;
  isLevel: number = Level.Default; // Inicializando com um valor padrão
  userName?: string; // Variável para armazenar o nome do usuário

  constructor(private authenticationService: AuthenticationService) {
    this.isLevel = Level.Default; // Atribuindo um valor no construtor
    this.authenticationService.user.subscribe((x) => {
      this.user = x;
      this.checkLevel();
      this.getUserName();
    });
    this.getUserName(); // Chamada adicional para garantir que o nome do usuário seja obtido inicialmente
  }


  toggleCadastroMenu() {
    this.isCadastroMenuOpen = !this.isCadastroMenuOpen;
  }

  toggleInterfaceMenu() {
    this.isInterfaceMenuOpen = !this.isInterfaceMenuOpen;
  }

  logout() {
    this.authenticationService.logout();
  }

  private checkLevel() {
    // Verificação do nível de permissão
    if (this.user && this.user.level === 22) {
      // O usuário tem permissão de administrador (nível 22)
      // Execute as ações apropriadas para administradores
      console.log('Esse user é o bichão ' + this.user.level);
      this.isLevel = Level.Admin;
    } else if (this.user && this.user.level === 15) {
      // O usuário tem permissão de gerente (nível 15)
      // Execute as ações apropriadas para gerentes
      this.isLevel = Level.Manager;
      console.log('Esse user é um gerente ' + this.user.level);
    } else if (this.user && this.user.level === 10) {
      // O usuário tem permissão de funcionário (nível 10)
      // Execute as ações apropriadas para funcionários
      console.log('Esse user é um supervisor ' + this.user.level);
      this.isLevel = Level.Supervisor;
    } else {
      // O usuário tem um nível de permissão diferente
      // Execute as ações apropriadas para convidados ou trate o caso de permissões desconhecidas
      console.log('Esse user é um funcionario ' + this.user?.level);
    }
  }

  getUserName() {
    if (this.user && this.user.name) {
      this.userName = this.user.name; // Atribui o nome do usuário à variável userName
      console.log(this.userName);
    }
  }


}
