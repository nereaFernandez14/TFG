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
  imports: [ReactiveFormsModule, CommonModule]
})
export class ChangePasswordComponent {
  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', [Validators.required]]
  });

  errorMessage = '';
  successMessage = '';
  currentPasswordError = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private http: HttpClient,
    private router: Router
  ) {}

  get passwordsNoMatch(): boolean {
    const newPassword = this.passwordForm.get('newPassword')?.value ?? '';
    const confirmNewPassword = this.passwordForm.get('confirmNewPassword')?.value ?? '';
    return newPassword !== confirmNewPassword;
  }

  cambiarPassword() {
    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

    if (this.passwordsNoMatch) {
      this.errorMessage = 'Las nuevas contraseñas no coinciden';
      this.successMessage = '';
      return;
    }

    this.http.get('https://localhost:8443/api/csrf', { withCredentials: true }).subscribe({
      next: () => {
        this.usuarioService.cambiarPassword(currentPassword!, newPassword!).subscribe({
          next: (res) => {
            console.log('✅ Respuesta del backend:', res);
            this.successMessage = res.message || '¡Contraseña actualizada!';
            this.errorMessage = '';
            this.currentPasswordError = '';
            this.passwordForm.reset();

            setTimeout(() => {
              this.router.navigate(['/miPerfil']);
            }, 2000);
          },
          error: (err) => {
            const backendMsg = err.error?.error || err.message;
            if (backendMsg.toLowerCase().includes('actual')) {
              this.currentPasswordError = backendMsg;
              this.errorMessage = '';
            } else {
              this.errorMessage = backendMsg;
              this.currentPasswordError = '';
            }
            this.successMessage = '';
          }
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo obtener el token CSRF';
        this.successMessage = '';
      }
    });
  }
}
