import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ], 
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
    private usuarioService: UsuarioService
  ) {}

  cambiarPassword() {
    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

    if (newPassword !== confirmNewPassword) {
      this.errorMessage = 'Las nuevas contraseñas no coinciden';
      return;
    }

    this.usuarioService.cambiarPassword(currentPassword!, newPassword!)
      .subscribe({
        next: () => {
          this.successMessage = '¡Contraseña actualizada! ✔️';
          this.errorMessage = '';
          this.passwordForm.reset();
        },
        error: err => {
          this.errorMessage = err.message || 'Error al cambiar contraseña ❌';
          this.successMessage = '';
        }
      });
  }
}
