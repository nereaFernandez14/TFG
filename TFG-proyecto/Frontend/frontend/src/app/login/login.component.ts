import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
    this.authService.login(username, password).subscribe({
      next: () => {
        this.authService.verificarSesion().subscribe({
          next: (respuesta) => {
            const rol = respuesta?.role ?? respuesta?.rol;

            if (!rol) {
              this.error = 'No se pudo determinar el rol del usuario.';
              this.cargando = false;
              return;
            }

            switch (rol) {
              case 'admin':
                this.router.navigate(['/admin']);
                break;
              case 'restaurante':
                this.router.navigate(['/restaurante']);
                break;
              case 'usuario':
                this.router.navigate(['/home']);
                break;
              default:
                console.warn(`⚠️ Rol desconocido (${rol}). Redirigiendo a /home.`);
                this.router.navigate(['/home']);
                break;
            }

            this.cargando = false;
          },
          error: () => {
            this.error = 'Error al verificar la sesión del usuario.';
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('Login error:', err);

        if (err?.status === 401) {
          this.error = '⚠️ Usuario o contraseña incorrectos.';
        } else if (err?.status === 0) {
          this.error = '❌ No se pudo conectar con el servidor.';
        } else {
          this.error = '❌ Error inesperado. Intenta de nuevo más tarde.';
        }

        this.cargando = false;
      }
    });
  }
}
