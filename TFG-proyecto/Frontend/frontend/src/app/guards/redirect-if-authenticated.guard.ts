import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';

export const RedirectIfAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  const rol = authService.obtenerRol()?.toUpperCase(); // ← mayúsculas por consistencia

  switch (rol) {
    case 'USUARIO':
      return router.createUrlTree(['/home']);
    case 'RESTAURANTE':
      return router.createUrlTree(['/restaurantes']);
    case 'ADMIN':
      return router.createUrlTree(['/admin']);
    default:
      return true; // visitante o no autenticado
  }
};
