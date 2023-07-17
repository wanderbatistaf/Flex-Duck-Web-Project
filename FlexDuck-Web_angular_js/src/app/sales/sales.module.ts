import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales.component';
import { LayoutComponent } from "@app/layout/layout.component";

const routes: Routes = [
  {
    path: 'sales', component: LayoutComponent, children: [
      { path: 'list', component: SalesComponent },
      { path: '', redirectTo: '/sales/list', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesModule { }
