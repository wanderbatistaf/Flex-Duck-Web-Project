import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import {Clients, Products} from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SalesService {

  constructor(private http: HttpClient) { }

  // Cria o método para requisitar todos os produtos
  getAllProducts(): Observable<Products[]> {
    return this.http.get<Products[]>(`${environment.apiUrl}/vendas`);
  }

  // Cria o método para adicionar um novo produto
  addProduct(newProduct: Products): Observable<Products> {
    return this.http.post<Products>(`${environment.apiUrl}/vendas/add`, newProduct);
  }

  // Cria o método para requisitar um produto específico pelo ID
  getProductById(id: number): Observable<Products> {
    return this.http.get<Products>(`${environment.apiUrl}/vendas/${id}`)
  }

  // Cria o método para deletar um produto específico pelo ID
  deleteProductById(id: number): Observable<Products> {
    return this.http.delete<Products>(`${environment.apiUrl}/products/delete/${id}`)
  }


}