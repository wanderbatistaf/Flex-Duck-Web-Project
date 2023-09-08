import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Suppliers } from '@app/_models';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class SuppliersService {
  constructor(private http: HttpClient) {}

  // Cria o método para requisitar todos os users
  getAll(): Observable<Suppliers[]> {
    return this.http.get<Suppliers[]>(`${environment.apiUrl}/suppliers`).pipe(
      tap((users: Suppliers[]) => console.log('API Response:', users)),
      catchError((error) => {
        console.log('Error in API call:', error);
        return throwError('Houve um erro na chamada à API');
      })
    );
  }

  // Cria o método para adicionar um novo user
  addSupplier(newUser: Suppliers): Observable<Suppliers> {
    return this.http.post<Suppliers>(`${environment.apiUrl}/suppliers/add`, newUser);
  }

  // Cria o método para requisitar um user específico pelo ID
  getSupplierById(id: number): Observable<Suppliers> {
    return this.http.get<Suppliers>(`${environment.apiUrl}/suppliers/${id}`);
  }

  // Cria o método para deletar um user específico pelo ID
  deleteSupplierById(user_id: number): Observable<Suppliers> {
    return this.http.delete<Suppliers>(
      `${environment.apiUrl}/suppliers/delete/${user_id}`
    );
  }

  // Cria o método para atualizar um user específico pelo ID
  updateSupplierById(user_id: number, updateClient: Suppliers): Observable<Suppliers> {
    return this.http.put<Suppliers>(
      `${environment.apiUrl}/suppliers/update/${user_id}`,
      updateClient
    );
  }

  // Cria o método para obter o último ID de usuário
  getLastSupplierId(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/suppliers/lastSupplierId`).pipe(
      catchError((error) => {
        console.log('Error in API call:', error);
        return throwError('Houve um erro na chamada à API');
      })
    );
  }

}
