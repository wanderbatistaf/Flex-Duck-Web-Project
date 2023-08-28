import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import {Clients, Products} from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {

  constructor(private http: HttpClient) { }

  // Cria o método para requisitar todos os produtos
  getAllProducts(): Observable<Products[]> {
    return this.http.get<Products[]>(`${environment.apiUrl}/products`);
  }

  // Cria o método para adicionar um novo produto
  addProduct(newProduct: Products): Observable<Products> {
    return this.http.post<Products>(`${environment.apiUrl}/products/add`, newProduct);
  }

  // Cria o método para adicionar produtos com variações de tamanho
  addVariations(newProducts: any[]): Observable<Products> {
    return this.http.post<Products>(`${environment.apiUrl}/products/add_variations`, newProducts);
  }

  // Cria o método para requisitar um produto específico pelo ID
  getProductById(id: string): Observable<Products> {
    return this.http.get<Products>(`${environment.apiUrl}/products/${id}`)
  }

  // Cria o método para deletar um produto específico pelo ID
  deleteProductById(id: number): Observable<Products> {
    return this.http.delete<Products>(`${environment.apiUrl}/products/delete/${id}`)
  }

  // Cria o método para atualizar um produto específico pelo ID
  updateProductById(id: number | undefined, updateProduct: Products): Observable<Products> {
    return this.http.put<Products>(`${environment.apiUrl}/products/update/${id}`, updateProduct)
  }

  // Cria o método para requisitar o ultimo código
  getLastCode(isProduct: number): Observable<Products> {
    return this.http.get<Products>(`${environment.apiUrl}/products/lastCode/${isProduct}`);
  }

  // Cria o método para requisitar o ultimo código
  ScanQRcode(codigo: string): Observable<Products> {
    return this.http.get<Products>(`${environment.apiUrl}/qrscan/${codigo}`);
  }

  // Cria o método para atualizar um produto específico pelo ID através do atalho
  updateProductByIdShortCut(id: number | undefined, updateProduct: Products): Observable<Products> {
    return this.http.put<Products>(`${environment.apiUrl}/products/shortcut/update/${id}`, updateProduct)
  }


}
