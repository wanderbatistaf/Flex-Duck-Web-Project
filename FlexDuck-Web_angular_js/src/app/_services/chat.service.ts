// import { Injectable } from '@angular/core';
// import { Socket } from 'ngx-socket-io';
// import { HttpClient } from '@angular/common/http';
// import {environment} from "@environments/environment";
// import {Observable} from "rxjs";
//
// @Injectable({
//   providedIn: 'root'
// })
// export class ChatService {
//   constructor(private socket: Socket, private http: HttpClient) { }
//
//   connectToSocket(roomCode: string | undefined, userName: string | undefined) {
//     // Conecte-se ao Socket.io usando o código da sala e o nome do usuário
//     this.socket.emit('join', { room: roomCode, user: userName });
//   }
//
//   sendMessage(roomCode: string, userName: string, message: string) {
//     // Envie a mensagem para o servidor Flask usando HTTP ou Socket.io
//     this.socket.emit('message', { room: roomCode, sender: userName, message: message });
//   }
//
//   abrirSalaDeChat(data: any) {
//     return this.http.post(`${environment.ChatApiUrl}/client-home`, data);
//   }
//
//   getRoomData(): Observable<any> {
//     return this.http.get('/room');
//   }
//
//   // Método para receber novas mensagens do servidor Flask
//   receiveMessage(): Observable<any> {
//     return this.socket.fromEvent('new-message');
//   }
// }
