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
import {QrscanComponent} from "@app/cadastro/products/qrscan/qrscan.component";
import {ContabilidadeComponent} from "@app/contabilidade/contabilidade/contabilidade.component";
import {NotasEntradaComponent} from "@app/contabilidade/notas-entrada/notas-entrada.component";
import {NotasSaidaComponent} from "@app/contabilidade/notas-saida/notas-saida.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'payments', component: PaymentsListComponent },
      {
        path: 'employes',
        component: EmployesComponent,
        children: [
          { path: '', redirectTo: 'consulta', pathMatch: 'full' },
          { path: 'cadastro', component: EmployesComponent },
          { path: 'consulta', component: EmployesComponent },
          { path: 'edicao_user', component: EmployesComponent },
        ]
      },
      { path: 'products', component: ProductsComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'contabil', component: ContabilidadeComponent },
      { path: 'notas-entrada', component: NotasEntradaComponent },
      { path: 'notas-saida', component: NotasSaidaComponent },
    ]
  },
  { path: 'products/qrscan/:codigo', component: QrscanComponent },
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
