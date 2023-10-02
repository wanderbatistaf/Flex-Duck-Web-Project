import { Component, OnInit } from '@angular/core';
import { NotifyService } from '@app/_services';
import { NotifyModel } from '@app/_models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  hasNotifications: boolean = false;
  showDropdown: boolean = false; // Variável para controlar a exibição do menu suspenso
  alertProducts: NotifyModel[] = []; // Array para armazenar os produtos com alerta
  notificationCount: number = 0;

  constructor(private notifyService: NotifyService) {}

  ngOnInit(): void {
    this.getNotifys();
  }

  getNotifys() {
    this.notifyService.getNotify().subscribe(
      (response: any) => {
        if (response.items && response.items.length > 0) {
          this.notificationCount = response.items.length;
          console.log(this.notificationCount);
          this.hasNotifications = true;
          this.alertProducts = response.items;
          console.log(this.alertProducts);
        }
      },
      (error) => {
        console.error('Erro ao buscar notificações', error);
      }
    );
  }

  toggleDropdown() {
    console.log('Sino clicado!')
    this.showDropdown = !this.showDropdown; // Alterne a exibição do menu suspenso
    console.log(this.showDropdown);
  }
}
