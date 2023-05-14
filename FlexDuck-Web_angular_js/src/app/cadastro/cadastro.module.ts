import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatCheckboxModule } from '@angular/material'
import { RouterModule } from '@angular/router';
import { TextMaskModule } from 'angular2-text-mask';

import { CadastroRoutingModule } from './cadastro-routing.module';
import { EmployesComponent } from './employes/employes.component';
import { ProductsComponent } from './products/products.component';
import { ClientsComponent } from './clients/clients.component';



@NgModule({
  declarations: [
    EmployesComponent,
    ProductsComponent,
    ClientsComponent
  ],
  imports: [
    CommonModule,
    CadastroRoutingModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    TextMaskModule
  ],
  exports: [
    EmployesComponent,
    ProductsComponent,
    ClientsComponent
  ]
})
export class CadastroModule { }
