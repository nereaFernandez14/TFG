import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ChangePasswordComponent {
  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', [Validators.required]]
  });

  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private http: HttpClient,
    private router: Router
  ) {}

  cambiarPassword() {
    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

    if (newPassword !== confirmNewPassword) {
      this.errorMessage = 'Las nuevas contraseñas no coinciden';
      this.successMessage = '';
      return;
    }

    // ⚠️ FORZAMOS petición GET para obtener el token XSRF
    this.http.get('https://localhost:8443/api/csrf', { withCredentials: true }).subscribe({
      next: () => {
        // ✅ Ahora Angular automáticamente enviará el X-XSRF-TOKEN
        this.usuarioService
          .cambiarPassword(currentPassword!, newPassword!)
          .subscribe({
            next: () => {
              this.successMessage = '¡Contraseña actualizada!';
              this.errorMessage = '';
              this.passwordForm.reset();
              setTimeout(() => this.router.navigate(['/profile']), 1500);
            },
            error: err => {
              this.errorMessage = err.message || 'Error al cambiar la contraseña';
              this.successMessage = '';
            }
          });
      },
      error: () => {
        this.errorMessage = 'No se pudo obtener el token CSRF';
      }
    });
  }

}
