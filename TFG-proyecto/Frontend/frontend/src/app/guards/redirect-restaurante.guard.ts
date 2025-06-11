import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';
import { RestauranteService } from '../services/restaurante.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

export const redirectRestauranteGuard: CanActivateFn = (): Observable<boolean> => {
  const auth = inject(AutenticacionService);
  const restauranteService = inject(RestauranteService);
  const router = inject(Router);

  const user = auth.obtenerUsuario();

  if (!user) {
    return of(true); // No logueado: permite ir a /home
  }

  if (user.rol === 'RESTAURANTE') {
    return restauranteService.obtenerRestaurantePorUsuario(user.id).pipe(
      tap((restaurante) => {
        if (restaurante && restaurante.id) {
          router.navigate(['/dashboard']); // Tiene restaurante → al dashboard
        } else {
          router.navigate(['/restaurantes/crear']); // No tiene restaurante → a crear
        }
      }),
      switchMap(() => of(false)), // Bloquea acceso a /home
      catchError(() => {
        router.navigate(['/restaurantes/crear']);
        return of(false); // En caso de error también redirige
      })
    );
  }

  return of(true); // Otros roles → pueden ir a /home
};
