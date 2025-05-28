import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AutenticacionService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.verificarSesion().pipe(
      map((respuesta: any) => {
        const rolNombre = respuesta?.role;
        console.log('🟡 AuthGuard → Rol recibido del backend:', rolNombre);

        if (rolNombre) {
          this.authService.actualizarRol(rolNombre); // 🔄 ya es string
          return true;
        }

        console.warn('🔒 Usuario no autenticado. Redirigiendo a login.');
        return this.router.createUrlTree(['/login']);
      }),
      catchError((err) => {
        console.error('❌ Error en AuthGuard:', err);
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
