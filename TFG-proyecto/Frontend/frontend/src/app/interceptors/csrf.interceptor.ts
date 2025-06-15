// src/app/csrf.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.getCookie('XSRF-TOKEN');

    // Solo añadimos el token si la petición es POST, PUT o DELETE
    const methodsRequiringCsrf = ['POST', 'PUT', 'DELETE'];

    const cloned = req.clone({
      withCredentials: true,
      ...(token && methodsRequiringCsrf.includes(req.method) ? {
        setHeaders: {
          'X-XSRF-TOKEN': decodeURIComponent(token)
        }
      } : {})
    });

    return next.handle(cloned);
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }
}
