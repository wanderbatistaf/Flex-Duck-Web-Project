import { Component } from '@angular/core';

import { AuthenticationService, CompanySettingsService } from '@app/_services';
import { User } from '@app/_models';
import { Level } from '@app/_models';
import { Modulo } from '@app/_models';
import {Router} from "@angular/router";
import {ModulosService} from "@app/_services/modulos.service";




@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  user?: User | null;
  isCadastroMenuOpen = true;
  isInterfaceMenuOpen = true;
  isContabilidadeMenuOpen = true;
  isLevel: number = Level.Default; // Inicializando com um valor padrão
  userName?: string; // Variável para armazenar o nome do usuário
  userID?: number; // Variável para armazenar o id do usuário
  private router: any;
  modulo: Modulo[] = [];
  modulosAtivos: { [modulo: string]: string } = {};
  isReady: boolean = false; // Variável de controle

  constructor(private authenticationService: AuthenticationService,
              router: Router,
              private ModulosService: ModulosService) {
  }

  ngOnInit() {
    this.isLevel = Level.Default; // Atribuindo um valor no construtor

    this.authenticationService.user.subscribe((x) => {
      this.user = x;
      this.checkLevel();
      this.getUserName();
      this.getUserID();
      this.getUserName(); // Chamada adicional para garantir que o nome do usuário seja obtido inicialmente
    });

    const savedModules = localStorage.getItem('modules');

    if (savedModules) {
      this.modulosAtivos = JSON.parse(savedModules);
      this.isReady = true;
    } else {
      this.ModulosService.getModules().subscribe((response: any) => {
        if (response && response.modulos && Array.isArray(response.modulos)) {
          response.modulos.forEach((modulo: any) => {
            this.modulosAtivos[modulo.modulo] = modulo.status; // Não precisa mais converter para String
          });

          // Salvar os módulos no localStorage
          localStorage.setItem('modules', JSON.stringify(this.modulosAtivos));

          this.isReady = true;
        }
      });
    }
  }





  isModuloAtivo(modulo: Modulo): boolean {
    return modulo.status === 'true'; // ou modulo.status === true, dependendo da implementação da API
  }

  toggleCadastroMenu() {
    this.isCadastroMenuOpen = !this.isCadastroMenuOpen;
  }

  toggleInterfaceMenu() {
    this.isInterfaceMenuOpen = !this.isInterfaceMenuOpen;
  }

  toggleContabilidadeMenu() {
    this.isContabilidadeMenuOpen = !this.isContabilidadeMenuOpen;
  }

  logout() {
    this.authenticationService.logout();
  }

  getUserID() {
    this.userID = this.user?.user_id;
    console.log(this.userID)
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

  navigateToEdit() {
    this.router.navigate(['/employes/edicao']);
  }



}
