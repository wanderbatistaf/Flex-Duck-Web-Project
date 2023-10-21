import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Servico } from "@app/_models";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServicosService {

    constructor(private http: HttpClient) { }

    // Cria o método para requisitar todos os servicos
    getAllServicos(): Observable<Servico[]> {
        return this.http.get<Servico[]>(`${environment.apiUrl}/servicos`);
    }

    // Cria o método para adicionar um novo servico
    addServico(newServico: Servico): Observable<Servico> {
        return this.http.post<Servico>(`${environment.apiUrl}/servicos/add`, newServico);
    }

    // Cria o método para adicionar um novo servico
    addServicoVenda(newServico: Servico): Observable<Servico> {
        return this.http.post<Servico>(`${environment.apiUrl}/servicos/sell/add`, newServico);
    }


    // Cria o método para requisitar o ultimo numero de OS
    getOSN(): Observable<Servico[]> {
        return this.http.get<Servico[]>(`${environment.apiUrl}/servicos/lastOsCode`)
    }

    // Cria o método para requisitar todos os servicos para o reports
    getAllServicosReport(): Observable<Servico[]> {
        return this.http.get<Servico[]>(`${environment.apiUrl}/servico/reports`);
    }

    updateStatus(numeroOrdem: number, novoStatus: string): Observable<Servico> {
        const statusUpdate = { status: novoStatus };
        return this.http.patch<Servico>(`${environment.apiUrl}/servicos/update_status/${numeroOrdem}`, statusUpdate);
    }



}
