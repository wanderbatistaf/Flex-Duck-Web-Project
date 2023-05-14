import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.less']
})
export class ProductsComponent implements OnInit {
  jwtHelper: JwtHelperService = new JwtHelperService();
  level?: string;

  constructor() { }

  ngOnInit(): void {
    const token = localStorage.getItem('token')
    const decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
    this.level = decodedToken?.level;
  }

}
