import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Products } from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotifyService {

  constructor(private http: HttpClient) {
  }

  // Cria o método para requisitar todos os produtos
  getNotify(): Observable<Products[]> {
    return this.http.get<Products[]>(`${environment.apiUrl}/notify/products`);
  }

}
