// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
//
// import { environment } from '@environments/environment';
// import { Payments } from '@app/_models';
// import { Observable } from 'rxjs';
//
// @Injectable({ providedIn: 'root' })
// export class PaymentsService {
//
//     constructor(private http: HttpClient) { }
//
//     // Cria o método para requisitar todos os pagamentos
//     getAll(): Observable<Payments[]> {
//         return this.http.get<Payments[]>(`${environment.apiUrl}/payments`);
//     }
//
//     // Cria o método para adicionar um novo pagamento
//     addPayment(newPayment: Payments): Observable<Payments> {
//         return this.http.post<Payments>(`${environment.apiUrl}/payments`, newPayment);
//     }
//
//     // Cria o método para requisitar um pagamento específico pelo ID
//     getPaymentById(id: number): Observable<Payments> {
//         return this.http.get<Payments>(`${environment.apiUrl}/payments/${id}`)
//     }
//
//     // Cria o método para deletar um pagamento específico pelo ID
//     deletePaymentById(id: number): Observable<Payments> {
//         return this.http.delete<Payments>(`${environment.apiUrl}/payments/${id}`)
//     }
//
//     // Cria o método para atualizar um pagamento específico pelo ID
//     updatePaymentById(id: number, updatePayment: Payments): Observable<Payments> {
//         return this.http.put<Payments>(`${environment.apiUrl}/payments/${id}`, updatePayment)
//     }
//
//
// }
