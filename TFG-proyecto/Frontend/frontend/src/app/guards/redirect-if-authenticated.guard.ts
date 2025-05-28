import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';

export const RedirectIfAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  const rol = authService.obtenerRol(); // ahora es string: 'usuario' | 'restaurante' | null

  if (rol === 'usuario') return router.createUrlTree(['/home']);
  if (rol === 'restaurante') return router.createUrlTree(['/restaurante']);

  return true; // visitante o sin rol
};
