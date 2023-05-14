import { Component, AfterViewInit } from '@angular/core';
import * as jQuery from 'jquery';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements AfterViewInit {
  ngAfterViewInit() {
    (function ($) {
      "use strict";

      // Adicionar estado ativo aos links da barra lateral de navegação
      var path = window.location.href; // propriedade 'href' do elemento DOM é o caminho absoluto
      $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function () {
        if (this instanceof HTMLAnchorElement && this.href === path) {
          $(this).addClass("active");
        }
      });

      // Toggle the side navigation
      $("#sidebarToggle").on("click", function (e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
      });
    })(jQuery);
  }
}
