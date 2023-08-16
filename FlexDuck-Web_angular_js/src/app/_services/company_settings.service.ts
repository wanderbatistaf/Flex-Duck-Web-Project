import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Company } from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanySettingsService {

    constructor(private http: HttpClient) { }

    // Cria o método para requisitar todos os dados da empresa
    getAllInfos(): Observable<Company[]> {
        return this.http.get<Company[]>(`${environment.apiUrl}/company_settings`);
    }

    // Atualizar as informações da empresa
    updateCompanyInfos(id: number | undefined, updateCompany: Company): Observable<Company> {
        return this.http.put<Company>(`${environment.apiUrl}/company_settings/att/${id}`, updateCompany)
    }

    // Verifica habilita/desabilita modulo de Mesas
    getModulesOn(): Observable<Company> {
        return this.http.get<Company>(`${environment.apiUrl}/company_settings/modulo_mesas`);
    }


}
