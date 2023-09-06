import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContabilService {

    constructor(private http: HttpClient) {
    }

    // getAllNotes(): Observable<> {
    //     return this.http.get<>(`${environment.apiUrl}/notas-entrada`);
    // }

    addNotes(extractedData: any, itensInseridos: any[]): Observable<any> {
        const dataToSend = {
            extractedData: extractedData,
            itensInseridos: itensInseridos,
        };

        return this.http.post<any>(`${environment.apiUrl}/notas-entrada/add`, dataToSend);
    }

}
