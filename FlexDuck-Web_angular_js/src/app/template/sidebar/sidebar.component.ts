import { Component } from '@angular/core';

import {AuthenticationService, CompanySettingsService, EncryptionService} from '@app/_services';
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
              private ModulosService: ModulosService,
              private encryptionService: EncryptionService) {

  }

  ngOnInit() {

    this.isLevel = Level.Default; // Atribuindo um valor no construtor

    this.authenticationService.user.subscribe((x) => {
      this.user = x;
      this.checkLevel();
      this.getUserName();
      this.getUserID();
      this.getUserName(); // Chamada adicional para garantir que o nome do usuário seja obtido inicialmente

      const savedModules = localStorage.getItem('modules');

      if (savedModules) {
        const decryptedData = this.encryptionService.decryptData(savedModules); // Descriptografa os dados
        this.modulosAtivos = decryptedData;
        this.isReady = true;
      } else {
        this.ModulosService.getModules().subscribe((response: any) => {
          if (response && response.modulos && Array.isArray(response.modulos)) {
            response.modulos.forEach((modulo: any) => {
              this.modulosAtivos[modulo.modulo] = modulo.status; // Não precisa mais converter para String
            });

            // Criptografa e salva os módulos no localStorage
            const encryptedData = this.encryptionService.encryptData(this.modulosAtivos);
            localStorage.setItem('modules', encryptedData);

            this.isReady = true;
          }
        });
      }
    });

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
  }

  private checkLevel() {
    // Verificação do nível de permissão
    if (this.user && this.user.level === 22) {
      // Execute as ações apropriadas para administradores
      this.isLevel = Level.Admin;
    } else if (this.user && this.user.level === 15) {
      // Execute as ações apropriadas para gerentes
      this.isLevel = Level.Manager;
    } else if (this.user && this.user.level === 10) {
      // O usuário tem permissão de funcionário (nível 10)
      this.isLevel = Level.Supervisor;
    } else {
      // O usuário tem um nível de permissão diferente
    }
  }

  getUserName() {
    if (this.user && this.user.name) {
      this.userName = this.user.name; // Atribui o nome do usuário à variável userName
    }
  }

  navigateToEdit() {
    this.router.navigate(['/employes/edicao']);
  }



}
