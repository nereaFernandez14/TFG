import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RestauranteService } from '../services/restaurante.service';
import { switchMap, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private restauranteService: RestauranteService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.error = '';
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;
    this.cargando = true;

    this.authService.prepararSesion().subscribe({
      next: () => {
        this.hacerLogin(username, password);
      },
      error: (err: any) => {
        console.error("❌ Error al preparar sesión:", err);
        this.error = 'No se pudo preparar la sesión. Intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  private hacerLogin(username: string, password: string): void {
    this.authService.login(username, password).pipe(
      switchMap((respuesta) => {
      const rol = (respuesta?.rol ?? respuesta?.role ?? '').toUpperCase();
      const usuario = this.authService.obtenerUsuario();

      if (!rol || !usuario?.id) {
        this.error = 'No se pudo determinar el rol o el ID del usuario.';
        return throwError(() => new Error('Rol o usuario no disponible'));
      }

      this.authService.actualizarRol(rol); // ✅ MUY IMPORTANTE

      if (rol === 'RESTAURANTE') {
        return this.restauranteService.obtenerRestaurantePorUsuario(usuario.id).pipe(
          tap((restaurante) => {
            if (restaurante && restaurante.id) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/restaurantes/crear']);
            }
          })
        );
      }

      if (rol === 'ADMIN') {
        this.router.navigate(['/admin-panel']);
        return of(null);
      }
      this.router.navigate(['/home']);
      return of(null);
    })
      ).subscribe({
      error: (err) => {
        console.error('❌ Error al iniciar sesión:', err);
        this.error = 'Error al iniciar sesión';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }


}
