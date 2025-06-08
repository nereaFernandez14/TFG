// src/app/guards/redirect-admin.guard.ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

export const redirectAdminGuard: CanActivateFn = () => {
  const auth = inject(AutenticacionService);
  const router = inject(Router);

  const user = auth.obtenerUsuario();

  if (user && user.rol === 'ADMIN') {
    router.navigate(['/admin-panel']);
    return of(false);
  }

  return of(true);
};
