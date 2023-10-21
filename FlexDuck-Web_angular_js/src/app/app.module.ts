import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { TemplateModule } from './template/template.module';
import { LayoutComponent } from './layout/layout.component';
import { SalesModule } from './sales/sales.module';
import { JwtHelperService } from "@auth0/angular-jwt";
import { EmployesComponent } from './cadastro/employes/employes.component';
import { ClientsComponent } from "@app/cadastro/clients/clients.component";
import { TextMaskModule } from "angular2-text-mask";
import {HashLocationStrategy, LocationStrategy, NgOptimizedImage} from "@angular/common";
import { SuppliersComponent } from "@app/cadastro/suppliers/suppliers.component";
import { ProductsComponent } from "@app/cadastro/products/products.component";
import { AnQrcodeModule } from "an-qrcode";
import { QrscanComponent } from "@app/cadastro/products/qrscan/qrscan.component";
import { ContabilidadeComponent } from './contabilidade/contabilidade/contabilidade.component';
import { NotasEntradaComponent } from './contabilidade/notas-entrada/notas-entrada.component';
import { NotasSaidaComponent } from './contabilidade/notas-saida/notas-saida.component';
import { SalesComponent } from "@app/sales/sales.component";
import {NgbModalModule, NgbModule, NgbDatepickerModule} from "@ng-bootstrap/ng-bootstrap";
import { FilterPipeC, ClienteModalComponent } from './modals/cliente-modal/cliente-modal.component';
import { FilterPipeV, VendedorModalComponent } from './modals/vendedor-modal/vendedor-modal.component';
import { FilterPipeP, ProdutoModalComponent } from './modals/produto-modal/produto-modal.component';
import {SharedService} from "@app/_services/SharedService";
import {FilterPipe, MesasComponent} from './custom_client_modules/mesas/mesas/mesas.component';
import {CustomHttpInterceptor} from "@app/_services";
import { SkeletonTableDisplay } from './_share/skeleton-table';
import {ConfigurationComponent} from "@app/configuration/configuration.component";
import {NgxPaginationModule} from "ngx-pagination";
import {DashboardComponent} from "@app/dashboard/dashboard.component";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {MatNativeDateModule} from "@angular/material/core";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
// import {ChatRoomComponent} from "@app/template/navbar/support_chat/chat-room.component";
// import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {environment} from "@environments/environment";
import { ServicosComponent } from './custom_client_modules/servicos/servicos.component';

// const config: SocketIoConfig = { url: `${environment.ChatApiUrl}`, options: {withCredentials:false} };


@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    TemplateModule,
    SalesModule,
    FormsModule,
    TextMaskModule,
    NgOptimizedImage,
    AnQrcodeModule,
    NgbModule,
    NgbModalModule,
    NgbDatepickerModule,
    NgxPaginationModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    NgxDatatableModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    // SocketIoModule.forRoot(config)
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    LayoutComponent,
    EmployesComponent,
    ClientsComponent,
    SuppliersComponent,
    ProductsComponent,
    QrscanComponent,
    ContabilidadeComponent,
    NotasEntradaComponent,
    NotasSaidaComponent,
    SalesComponent,
    ClienteModalComponent,
    VendedorModalComponent,
    ProdutoModalComponent,
    MesasComponent,
    ConfigurationComponent,
    FilterPipe,
    FilterPipeP,
    FilterPipeV,
    FilterPipeC,
    SkeletonTableDisplay,
    DashboardComponent,
    // ChatRoomComponent,
    ServicosComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    JwtHelperService,
    SharedService,
    // ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    // Registrar o ícone do Font Awesome
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/fontawesome-free-5.15.3-web/svgs/solid.svg'));
  }
}
