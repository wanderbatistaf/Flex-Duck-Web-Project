import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import {Clients, Products, Sales} from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SalesService {

  constructor(private http: HttpClient) { }

  // Cria o método para requisitar todos os produtos
  getAllVendas(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${environment.apiUrl}/vendas`);
  }

  // Cria o método para adicionar um novo produto
  addVenda(newProduct: Products): Observable<Products> {
    return this.http.post<Products>(`${environment.apiUrl}/vendas/add`, newProduct);
  }

  // Cria o método para adicionar um novo produto
  addMesasVenda(newProduct: Products): Observable<Products> {
    return this.http.post<Products>(`${environment.apiUrl}/vendas/mesas/add`, newProduct);
  }

  // Cria o método para requisitar um produto específico pelo ID
  getProductById(id: number): Observable<Products> {
    return this.http.get<Products>(`${environment.apiUrl}/vendas/${id}`)
  }

  // Cria o método para requisitar o ultimo numero de CF
  getCFN(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${environment.apiUrl}/vendas/cfn`)
  }

  // Cria o método para deletar um produto específico pelo ID
  deleteProductById(id: number): Observable<Products> {
    return this.http.delete<Products>(`${environment.apiUrl}/products/delete/${id}`)
  }

  // Cria o método para requisitar todos os produtos para o reports
  getAllVendasReport(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${environment.apiUrl}/vendas/reports`);
  }


}
