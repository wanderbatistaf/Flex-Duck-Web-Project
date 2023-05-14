import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Cep } from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ViaCepService {

  constructor(private http: HttpClient) { }

  getAddress(zipCode: string): Observable<any> {
    const url = `https://viacep.com.br/ws/${zipCode}/json/`;
    return this.http.get(url);
  }



}
