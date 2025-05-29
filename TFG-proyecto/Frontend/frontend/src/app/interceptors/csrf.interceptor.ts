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

    const cloned = req.clone({
      withCredentials: true,
      ...(token ? {
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
