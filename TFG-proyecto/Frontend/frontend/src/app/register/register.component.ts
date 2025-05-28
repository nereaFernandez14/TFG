import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../services/usuario.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { RolService } from '../services/rol.service';

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
  roles: { id: number, nombre: string }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly usuarioService: UsuarioService,
    private readonly authService: AutenticacionService,
    private readonly rolService: RolService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Prepara cookies JSESSIONID + XSRF-TOKEN
    this.authService.prepararSesion().subscribe({
      next: () => console.log('✅ Sesión preparada para el registro'),
      error: (err) => console.warn('⚠️ No se pudo preparar la sesión:', err)
    });

    // ✅ Carga dinámica de roles desde el backend, excluyendo "admin" y "administrador"
    this.rolService.obtenerRoles().subscribe({
      next: (data) => {
        this.roles = data
          .filter(r => {
            const nombre = r?.nombre?.trim().toLowerCase();
            return !!nombre && nombre !== 'admin' && nombre !== 'administrador';
          })
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        console.log('📋 Roles cargados (filtrados y ordenados):', this.roles);
      },
      error: (err) => {
        console.error('❌ Error al cargar roles desde el backend:', err);
        this.roles = [];
      }
    });

    // 🧾 Inicializa el formulario
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rolId: [null, Validators.required]
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
    console.log('📤 Enviando datos de registro:', formData);

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
