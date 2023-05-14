import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatCheckboxModule } from '@angular/material'
import { RouterModule } from '@angular/router';

import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsListComponent } from './payments-list/payments-list.component';



@NgModule({
  declarations: [
    PaymentsListComponent
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
    MatCardModule
  ],
  exports: [
    PaymentsListComponent
  ]
})
export class PaymentsModule { }
