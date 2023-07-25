import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import {Bandeiras, Paytype} from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FuncPaymentsService {

  constructor(private http: HttpClient) { }

  // Cria o método para requisitar todas as formas de pagamento
  getAllPayTypes(): Observable<Paytype[]> {
    return this.http.get<Paytype[]>(`${environment.apiUrl}/forma_pagamento`);
  }

  getAllBandsTypes(): Observable<Bandeiras[]> {
    return this.http.get<Bandeiras[]>(`${environment.apiUrl}/bandeiras`);
  }

  // Cria o método para adicionar uma forma de pagamento
  addPayType(newProduct: Paytype): Observable<Paytype> {
    return this.http.post<Paytype>(`${environment.apiUrl}/forma_pagamento/add`, newProduct);
  }

  // Cria o método para requisitar uma forma de pagamento específico pelo ID
  getPayTypeById(id: number): Observable<Paytype> {
    return this.http.get<Paytype>(`${environment.apiUrl}/forma_pagamento/${id}`)
  }

  // Cria o método para deletar uma forma de pagamento específico pelo ID
  deletePayTypeById(id: number): Observable<Paytype> {
    return this.http.delete<Paytype>(`${environment.apiUrl}/forma_pagamento/delete/${id}`)
  }

  // Cria o método para atualizar uma forma de pagamento específica pelo ID
  updatePayTypeById(id: number | undefined, updatePaytType: Paytype): Observable<Paytype> {
    return this.http.put<Paytype>(`${environment.apiUrl}/forma_pagamento/update/${id}`, updatePaytType)
  }

  // // Cria o método para requisitar o ultimo código
  // getLastCode(isProduct: number): Observable<Products> {
  //   return this.http.get<Products>(`${environment.apiUrl}/forma_pagamento/lastCode/${isProduct}`);
  // }


}
