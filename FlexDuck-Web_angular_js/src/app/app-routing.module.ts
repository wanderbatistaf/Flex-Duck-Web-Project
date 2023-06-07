import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login';
import { PaymentsListComponent } from './payments/payments-list/payments-list.component';
import { AuthGuard } from './_helpers';
import { EmployesComponent } from "@app/cadastro/employes/employes.component";
import { ProductsComponent } from "@app/cadastro/products/products.component";
import { ClientsComponent } from "@app/cadastro/clients/clients.component";
import {SuppliersComponent} from "@app/cadastro/suppliers/suppliers.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component:LayoutComponent, children: [
      { path: '', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'home', component: HomeComponent },
      { path: 'payments', component: PaymentsListComponent },
      { path: 'employes', component: EmployesComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'suppliers', component: SuppliersComponent }
    ]},



  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
