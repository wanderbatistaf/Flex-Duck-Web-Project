import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsListComponent } from './payments-list/payments-list.component';
import { LayoutComponent } from "@app/layout/layout.component";

const routes: Routes = [
  {
    path: 'payments', component: LayoutComponent, children: [
      { path: 'list', component: PaymentsListComponent },
      { path: '', redirectTo: '/payments/list', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsRoutingModule { }
