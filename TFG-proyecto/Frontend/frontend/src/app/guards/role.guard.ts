import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AutenticacionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const rolEsperado = route.data['rol']; // ← string esperado desde la ruta
    const rolActual = this.authService.obtenerRol(); // ← ya es string

    console.log(`👮‍♂️ RoleGuard → Esperado: ${rolEsperado} | Actual: ${rolActual}`);

    if (!rolActual) {
      console.warn('🔒 Usuario no autenticado. Redirigiendo a /login');
      return of(this.router.createUrlTree(['/login']));
    }

    if (rolActual === rolEsperado) {
      return of(true);
    }

    console.warn(`⛔ Acceso denegado a ${route.routeConfig?.path}. Requiere: ${rolEsperado}, Tiene: ${rolActual}`);
    return of(this.router.createUrlTree(['/unauthorized']));
  }
}
