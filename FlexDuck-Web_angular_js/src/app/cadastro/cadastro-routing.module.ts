import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from "@app/layout/layout.component";
import {EmployesComponent} from "@app/cadastro/employes/employes.component";
import {ProductsComponent} from "@app/cadastro/products/products.component";
import {ClientsComponent} from "@app/cadastro/clients/clients.component";
import {SuppliersComponent} from "@app/cadastro/suppliers/suppliers.component";

const routes: Routes = [
  {
    path: 'employes', component: LayoutComponent, children: [
      { path: 'list', component: EmployesComponent },
      { path: '', redirectTo: '/employes/list', pathMatch: 'full' }
    ]
  },

  {
    path: 'products', component: LayoutComponent, children: [
      { path: 'list', component: ProductsComponent },
      { path: '', redirectTo: '/products/list', pathMatch: 'full' }
    ]
  },

  {
    path: 'clients', component: LayoutComponent, children: [
      { path: 'list', component: ClientsComponent },
      { path: '', redirectTo: '/clients/list', pathMatch: 'full' }
    ]
  },

  {
    path: 'suppliers', component: LayoutComponent, children: [
      { path: 'list', component: SuppliersComponent },
      { path: '', redirectTo: '/suppliers/list', pathMatch: 'full' }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadastroRoutingModule { }
