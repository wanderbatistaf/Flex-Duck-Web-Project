import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Clients } from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientsService {

  constructor(private http: HttpClient) { }

  // Cria o método para requisitar todos os clientes
  getAll(): Observable<Clients[]> {
    return this.http.get<Clients[]>(`${environment.apiUrl}/clients`);
  }

  // Cria o método para adicionar um novo cliente
  addClient(newClient: Clients): Observable<Clients> {
    return this.http.post<Clients>(`${environment.apiUrl}/clients/add`, newClient);
  }

  // Cria o método para requisitar um cliente específico pelo ID
  getClientById(id: number): Observable<Clients> {
    return this.http.get<Clients>(`${environment.apiUrl}/clients/${id}`)
  }

  // Cria o método para deletar um cliente específico pelo ID
  deleteClientById(id: number): Observable<Clients> {
    return this.http.delete<Clients>(`${environment.apiUrl}/clients/delete/${id}`)
  }

  // Cria o método para atualizar um cliente específico pelo ID
  updateClientById(id: number, updateClient: Clients): Observable<Clients> {
    return this.http.put<Clients>(`${environment.apiUrl}/clients/update/${id}`, updateClient)
  }


}
