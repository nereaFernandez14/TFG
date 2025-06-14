import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
    // ✅ Token CSRF inicial
    this.authService.obtenerCsrfToken().subscribe({
      next: () => console.log('✅ Token CSRF obtenido correctamente'),
      error: (err) => console.warn('⚠️ No se pudo obtener el token CSRF:', err)
    });

    // 🛡️ Validador personalizado
    const sinPalabrasMalSonantes = (control: AbstractControl): ValidationErrors | null => {
      const prohibidas = ['puta', 'mierda', 'gilipollas', 'imbécil', 'estúpido'];
      const valor = control.value?.toLowerCase() || '';
      const contiene = prohibidas.some(palabra => valor.includes(palabra));
      return contiene ? { malsonante: true } : null;
    };

    // 🧾 Formulario reactivo
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, sinPalabrasMalSonantes]],
      apellidos: ['', [Validators.required, sinPalabrasMalSonantes]],
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

    this.usuarioService.registrar(formData).subscribe({
      next: () => {
        console.log('✅ Registro exitoso. Iniciando sesión automáticamente...');

        // 🔐 Login automático tras registro
        this.authService.login(formData.email, formData.password).subscribe({
          next: () => {
            console.log('✅ Login automático completado');
            this.router.navigate(['/home']);
          },
          error: (loginErr) => {
            console.error('❌ Error al iniciar sesión automáticamente:', loginErr);
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        console.error('❌ Error en el registro:', err);
        this.errorMessage = err?.error?.message || 'No se pudo completar el registro. Intenta nuevamente.';
        this.isSubmitting = false;
      }
    });
  }
}
