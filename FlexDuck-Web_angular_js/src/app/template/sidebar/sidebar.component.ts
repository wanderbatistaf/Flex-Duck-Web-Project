import { Component } from '@angular/core';

import { AuthenticationService } from '@app/_services';
import { User } from '@app/_models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  user?: User | null;
  isCadastroMenuOpen = false;
  isInterfaceMenuOpen = false;

  constructor(private authenticationService: AuthenticationService) {
    this.authenticationService.user.subscribe(x => this.user = x);
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
}
