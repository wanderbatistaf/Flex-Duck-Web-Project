import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {SuppliersComponent} from "@app/cadastro/suppliers/suppliers.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PaymentsRoutingModule} from "@app/payments/payments-routing.module";
import {RouterModule} from "@angular/router";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatCardModule} from "@angular/material/card";
import { TextMaskModule } from 'angular2-text-mask';


@NgModule({
  declarations: [
    SuppliersComponent
  ],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
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
    SuppliersComponent
  ]
})
export class SuppliersModule { }
