import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';


import { Cep } from "@app/_models";
import { Observable } from 'rxjs';
import {environment} from "@environments/environment";

@Injectable({ providedIn: 'root' })
export class ViaCepService {

  constructor(private http: HttpClient) { }

  getAddress(zipCode: string): Observable<any> {
    const url = `${environment.apiUrl}/get_address/${zipCode}`;
    return this.http.get(url);
  }
}
