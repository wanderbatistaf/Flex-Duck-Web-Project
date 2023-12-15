import { Component, HostListener, OnInit } from '@angular/core';
import { AuthenticationService } from './_services';
import { User } from './_models';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent implements OnInit {
  user?: User | null;
  isZoomed = false; // Variável para controlar o estado do zoom

  constructor(private authenticationService: AuthenticationService) {
    this.authenticationService.user.subscribe(x => this.user = x);
  }

  ngOnInit() {
    this.checkScreenSize(); // Chama a função ao inicializar o componente
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  logout() {
    this.authenticationService.logout();
  }

  checkScreenSize(): void {
    if (window.innerWidth < 1079) {
      this.isZoomed = true; // Aplicar o zoom
      console.log("Zoom Aplicado")
    } else {
      this.isZoomed = false; // Reverter o zoom
      console.log("Zoom Revertido")
    }
  }
}
