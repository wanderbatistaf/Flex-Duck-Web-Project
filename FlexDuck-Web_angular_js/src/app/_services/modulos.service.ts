import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import {Modulo} from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModulosService {

  constructor(private http: HttpClient) { }

  getModules(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${environment.apiUrl}/modules`);
  }

  updateModuleStatus(module: Modulo): Observable<Modulo> {
    const url = `${environment.apiUrl}/modules/${module.id}`; // Substitua "id" pelo campo correto
    return this.http.put<Modulo>(url, module);
  }

  getModuloMesasDetails(): Observable<Modulo> {
    return this.http.get<Modulo>(`${environment.apiUrl}/modules/mesas`);
  }

  toggleModuloMesasStatus(): Observable<Modulo> {
    return this.http.put<Modulo>(`${environment.apiUrl}/modules/mesas/toggle`, null);
  }

  toggleModuloVarejoStatus(): Observable<Modulo> {
    return this.http.put<Modulo>(`${environment.apiUrl}/modules/varejo/toggle`, null);
  }

  toggleModuloServicosStatus(): Observable<Modulo> {
    return this.http.put<Modulo>(`${environment.apiUrl}/modules/varejo/toggle`, null);
  }

}
