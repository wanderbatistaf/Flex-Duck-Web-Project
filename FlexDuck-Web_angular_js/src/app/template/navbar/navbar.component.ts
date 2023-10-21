import { Component, OnInit } from '@angular/core';
import {NotifyService} from '@app/_services';
import { NotifyModel } from '@app/_models';

interface ChatApiResponse {
  message: string;
  name: string;
  room: string;
}


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  hasNotifications: boolean = false;
  showDropdown: boolean = false; // Variável para controlar a exibição do menu suspenso
  showChatDropdown: boolean = false; //  Variável para controlar a exibição do menu suspenso
  alertProducts: NotifyModel[] = []; // Array para armazenar os produtos com alerta
  notificationCount: number = 0;
  initial_message: string = '';
  isChatOpen: boolean = false;
  chatMessages: any[] = []; // Para armazenar mensagens do chat
  newMessage: string = ''; // Para armazenar a nova mensagem digitada pelo usuário
  roomCode: string = '';
  isChatMinimized: boolean = false;
  initialMessage: any = '';
  roomData: any = '';
  messages: any[] = [];
  lastReadTime: number = 0;
  lastKnownMessageId: string = '';


  constructor(private notifyService: NotifyService,
              // private http: HttpClient,
              // private socket: Socket,
              // private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.getNotifys();
    // this.getRoomData();
    //
    // // this.checkForNewMessages();
    //
    // setInterval(() => {
    //   this.checkForNewMessages();
    // }, 30000); // 30 segundos em milissegundos
  }

  getNotifys() {
    this.notifyService.getNotify().subscribe(
      (response: any) => {
        if (response.items && response.items.length > 0) {
          this.notificationCount = response.items.length;
          console.log(this.notificationCount);
          this.hasNotifications = true;
          this.alertProducts = response.items;
          console.log(this.alertProducts);
        }
      },
      (error) => {
        console.error('Erro ao buscar notificações', error);
      }
    );
  }

  toggleDropdown() {
    // console.log('Sino clicado!')
    this.showDropdown = !this.showDropdown; // Alterne a exibição do menu suspenso
    // console.log(this.showDropdown);
  }

  toggleChatDropdown() {
    // console.log('Sino clicado!')
    this.showChatDropdown = !this.showChatDropdown; // Alterne a exibição do menu suspenso
    // console.log(this.showChatDropdown);
  }

  // abrirSalaDeChat() {
  //   // Nome do cliente, que você pode definir dinamicamente ou obtê-lo de alguma forma
  //   const nomeCliente = 'Nome do Cliente Aqui';
  //
  //   // Crie um objeto com os dados necessários para abrir a sala
  //   const data = {
  //     name: nomeCliente,
  //     create: true, // Indica que uma nova sala deve ser criada
  //     initial_message: this.initial_message // Use a mensagem inicial do textarea
  //   };
  //
  //   // Cabeçalho Content-Type como application/json
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //
  //   // Serviço para abrir a sala de chat no servidor Flask
  //   this.http.post<ChatApiResponse>(`${environment.ChatApiUrl}/client-home`, data, { headers }).subscribe(
  //     (response) => {
  //       // Resposta do servidor, se necessário
  //       console.log('Sala de chat aberta com sucesso:', response);
  //       this.showChatDropdown = false;
  //       this.isChatOpen = true;
  //       this.roomCode = response.room;
  //       console.log(this.roomCode);
  //
  //       // Você pode adicionar código aqui para atualizar a interface do usuário com os detalhes da sala, se necessário
  //     },
  //     (error) => {
  //       // Lide com erros, se houver algum
  //       console.error('Erro ao abrir sala de chat:', error);
  //
  //       // Você pode adicionar código aqui para exibir uma mensagem de erro ao usuário, se necessário
  //     }
  //   );
  // }
  //
  //
  // sendMessage(newMessage: string) {
  //   // Obtenha a mensagem do usuário
  //   const message = newMessage;
  //   const userName = 'Nome do Cliente Aqui'; // Substitua pelo nome do usuário apropriado
  //   const roomCode = this.roomCode;
  //   const time = Date.now() / 1000;
  //
  //   console.log(roomCode);
  //
  //   if (message.trim() === '') {
  //     console.error('A mensagem está vazia. Não será enviada.');
  //     return;
  //   }
  //
  //   // Crie um objeto para enviar a mensagem
  //   const data = {
  //     room: roomCode,
  //     sender: userName,
  //     message: message,
  //     time: time
  //   };
  //
  //   // Defina o cabeçalho Content-Type como application/json
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //
  //   // Chame a rota Flask para enviar a mensagem
  //   this.http.post(`${environment.ChatApiUrl}/send_or_check_messages/${roomCode}`, data, { headers }).subscribe(
  //     (response) => {
  //       // Lide com a resposta do servidor, se necessário
  //       console.log('Mensagem enviada com sucesso:', response);
  //       console.log(roomCode);
  //
  //       this.checkForNewMessages();
  //
  //       // Limpe o campo de entrada após o envio
  //       this.newMessage = '';
  //     },
  //     (error) => {
  //       // Lide com erros, se houver algum
  //       console.error('Erro ao enviar mensagem:', error);
  //       console.log(roomCode);
  //
  //       // Você pode adicionar código aqui para exibir uma mensagem de erro ao usuário, se necessário
  //     }
  //   );
  // }
  //
  //
  // toggleChat() {
  //   this.isChatMinimized = !this.isChatMinimized;
  // }
  //
  // closeChatAndLogout() {
  //   const socketId = this.socket.ioSocket.id; // Obtenha o ID de socket
  //   this.http.post(`${environment.ChatApiUrl}/disconnect`, { sid: socketId }).subscribe(
  //     (response) => {
  //       // Lide com a resposta do servidor, se necessário
  //       console.log('Desconectado com sucesso:', response);
  //
  //       // Feche o chat ou faça qualquer outra ação necessária
  //       this.isChatOpen = false;
  //     },
  //     (error) => {
  //       // Lide com erros, se houver algum
  //       console.error('Erro ao desconectar:', error);
  //     }
  //   );
  // }
  //
  // getRoomData() {
  //   this.http.get(`${environment.ChatApiUrl}/room`).subscribe(
  //     (data: any) => {
  //       this.roomData = data;
  //       this.roomCode = this.roomData.room;
  //       console.log('Dados da sala:', this.roomData);
  //       console.log('Código da sala:', this.roomCode);
  //     },
  //     (error) => {
  //       console.error('Erro ao obter dados da sala:', error);
  //     }
  //   );
  // }
  //
  // checkForNewMessages() {
  //   // Verifique se o chat está aberto
  //   if (!this.isChatOpen) {
  //     return;
  //   }
  //
  //   const lastKnownMessageId = this.lastKnownMessageId;
  //   const roomCode = this.roomCode;
  //
  //   this.http.get(`${environment.ChatApiUrl}/send_or_check_messages/${roomCode}?last_known_message_id=${lastKnownMessageId}`).subscribe(
  //     (response: any) => {
  //       if (response.status === "error" && (response.room_closed === true || response.error === "Sala não encontrada")) {
  //         console.log('A sala não foi encontrada ou está fechada. Parando de verificar mensagens.');
  //         return; // Pare de verificar mensagens se a sala não for encontrada ou estiver fechada
  //       }
  //
  //       const newMessages = response.messages;
  //       const receivedMessages = []; // Criar uma matriz para armazenar as mensagens recebidas
  //
  //       for (const message of newMessages) {
  //         if (message.hasOwnProperty('message_id')) {
  //           const messageId = message.message_id;
  //           console.log('Mensagem recebida com message_id:', messageId);
  //
  //           // Adicione um console.log antes da atualização
  //           console.log('Valor atual de this.lastKnownMessageId:', this.lastKnownMessageId);
  //
  //           // Atualize o lastKnownMessageId para o último message_id conhecido
  //           this.lastKnownMessageId = messageId;
  //
  //           // Adicione um console.log após a atualização
  //           console.log('Novo valor de this.lastKnownMessageId:', this.lastKnownMessageId);
  //
  //           receivedMessages.push(message);
  //         } else {
  //           console.error('Mensagem recebida não possui campo "message_id".');
  //         }
  //       }
  //
  //       // Exibir todas as mensagens recebidas no console
  //       console.log('Mensagens recebidas:', receivedMessages);
  //
  //       // Atualize a hora de leitura apenas quando novas mensagens forem processadas com sucesso
  //       this.updateLastReadTime();
  //
  //       // Adicione as novas mensagens à lista de mensagens
  //       this.displayNewMessages(newMessages);
  //     },
  //     (error) => {
  //       console.error('Erro ao verificar mensagens novas:', error);
  //     }
  //   );
  // }



  // updateLastReadTime(): void {
  //   // Atualiza o timestamp Unix da última mensagem lida para o momento atual
  //   this.lastReadTime = Date.now() / 1000;
  // }

  // displayNewMessages(messages: any[]): void {
  //   // Adiciona as mensagens recebidas à lista de mensagens no componente
  //   this.messages = this.messages.concat(messages);
  //   console.log(this.messages);
  // }

  // getLastKnownMessageId(): string {
  //   if (this.isChatOpen) {
  //     // Obtenha o last_known_message_id da última mensagem conhecida
  //     return this.lastKnownMessageId;
  //   } else {
  //     // Se o chat não estiver aberto, retorne o último last_known_message_id conhecido
  //     return this.lastKnownMessageId;
  //   }
  // }













}
