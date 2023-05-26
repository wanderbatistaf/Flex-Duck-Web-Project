import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { TemplateModule } from './template/template.module';
import { LayoutComponent } from './layout/layout.component';
import { PaymentsModule } from './payments/payments.module';
import {JwtHelperService} from "@auth0/angular-jwt";
import { EmployesComponent } from './cadastro/employes/employes.component';
import {ClientsComponent} from "@app/cadastro/clients/clients.component";
import {TextMaskModule} from "angular2-text-mask";
import {NgOptimizedImage} from "@angular/common";
import {SuppliersComponent} from "@app/cadastro/suppliers/suppliers.component";



@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    TemplateModule,
    PaymentsModule,
    FormsModule,
    TextMaskModule,
    NgOptimizedImage
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    LayoutComponent,
    EmployesComponent,
    ClientsComponent,
    SuppliersComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    JwtHelperService // Adicione o serviço aos providers do módulo
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
