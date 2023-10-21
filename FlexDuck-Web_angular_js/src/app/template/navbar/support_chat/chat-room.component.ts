// import { Component, OnInit } from '@angular/core';
// import { ChatService } from '@app/_services';
// import {Observable} from "rxjs";
// import {Clients} from "@app/_models";
// import {environment} from "@environments/environment";
//
// @Component({
//   selector: 'app-chat-room',
//   templateUrl: './chat-room.component.html',
//   styleUrls: ['./chat-room.component.less']
// })
// export class ChatRoomComponent implements OnInit {
//   roomCode: string = '';
//   userName: string = '';
//   messages: string[] = [];
//   messageInput: string = '';
//
//
//   constructor(private chatService: ChatService) { }
//
//   ngOnInit(): void {
//     // Inicialize o Socket.io e comece a receber mensagens aqui
//     this.chatService.connectToSocket(this.roomCode, this.userName);
//     this.chatService.receiveMessage().subscribe((message: string) => {
//       this.messages.push(message);
//     });
//   }
//
//   sendMessage() {
//     if (this.messageInput.trim() === '') return;
//     this.chatService.sendMessage(this.roomCode, this.userName, this.messageInput);
//     this.messageInput = '';
//   }
//
// }
