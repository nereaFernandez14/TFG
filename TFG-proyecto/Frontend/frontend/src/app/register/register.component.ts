import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../services/usuario.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { RolNombre } from '../models/enums/RolNombre.enum';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  formSubmitted = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  // ✅ Usamos enum y excluimos ADMIN
  roles = Object.values(RolNombre).filter(rol => rol !== RolNombre.ADMIN);

  constructor(
    private readonly fb: FormBuilder,
    private readonly usuarioService: UsuarioService,
    private readonly authService: AutenticacionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Solicitamos el token CSRF (también fuerza la creación de sesión)
    this.authService.obtenerCsrfToken().subscribe({
      next: () => console.log('✅ Token CSRF obtenido correctamente'),
      error: (err) => console.warn('⚠️ No se pudo obtener el token CSRF:', err)
    });

    // 🧾 Inicializa el formulario
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: [RolNombre.USUARIO, Validators.required] // Valor por defecto
    });
  }

  onSubmit(): void {
    this.formSubmitted = false;
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.registerForm.value;
    console.log('📤 Enviando datos de registro (enum):', formData);

    this.usuarioService.registrar(formData).subscribe({
      next: () => {
        this.formSubmitted = true;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('❌ Error en el registro:', err);
        this.errorMessage = err?.error?.message || 'No se pudo completar el registro. Intenta nuevamente.';
        this.isSubmitting = false;
      }
    });
  }
}
