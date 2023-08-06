import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtenha o subdomínio do host atual (por exemplo, "smarttech.flexduck.com")
    const subdomain = window.location.host;

    // Clone a requisição e adicione um cabeçalho personalizado com o subdomínio
    const modifiedReq = req.clone({
      setHeaders: { 'X-Subdomain': subdomain },
    });

    // Prossiga para a próxima etapa do manipulador de requisição
    return next.handle(modifiedReq);
  }
}
