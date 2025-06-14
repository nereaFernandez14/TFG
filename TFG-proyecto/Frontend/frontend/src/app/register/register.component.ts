import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../services/usuario.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { RolNombre } from '../models/enums/RolNombre.enum';
import { map, catchError, of } from 'rxjs';

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

  errorNombrePersonalizado: string | null = null;
  errorApellidosPersonalizado: string | null = null;

  roles = Object.values(RolNombre).filter(rol => rol !== RolNombre.ADMIN);
  palabrasProhibidas = ['puta', 'mierda', 'gilipollas', 'imbécil', 'estúpido'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly usuarioService: UsuarioService,
    private readonly authService: AutenticacionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.obtenerCsrfToken().subscribe({
      next: () => console.log('✅ Token CSRF obtenido correctamente'),
      error: (err) => console.warn('⚠️ No se pudo obtener el token CSRF:', err)
    });

    const sinPalabrasMalSonantes = (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value?.toLowerCase() || '';
      const contiene = this.palabrasProhibidas.some(p => valor.includes(p));
      return contiene ? { malsonante: true } : null;
    };

    const emailNoRegistrado: AsyncValidatorFn = (control: AbstractControl) => {
      const email = control.value;
      if (!email) return of(null);
      return this.usuarioService.verificarEmail(email).pipe(
        map((existe) => (existe ? { emailYaRegistrado: true } : null)),
        catchError(() => of(null))
      );
    };

    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, sinPalabrasMalSonantes]],
      apellidos: ['', [Validators.required, sinPalabrasMalSonantes]],
      email: ['', [Validators.required, Validators.email], [emailNoRegistrado]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: [RolNombre.USUARIO, Validators.required]
    });
  }

  onSubmit(): void {
    this.formSubmitted = false;
    this.errorMessage = null;

    const nombre = this.registerForm.get('nombre')?.value?.toLowerCase() || '';
    const apellidos = this.registerForm.get('apellidos')?.value?.toLowerCase() || '';

    this.errorNombrePersonalizado = this.palabrasProhibidas.some(p => nombre.includes(p)) ? 'El nombre contiene palabras no permitidas' : null;
    this.errorApellidosPersonalizado = this.palabrasProhibidas.some(p => apellidos.includes(p)) ? 'Los apellidos contienen palabras no permitidas' : null;

    if (this.registerForm.invalid || this.errorNombrePersonalizado || this.errorApellidosPersonalizado) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.registerForm.value;

    this.usuarioService.registrar(formData).subscribe({
      next: () => {
        this.authService.login(formData.email, formData.password).subscribe({
          next: () => this.router.navigate(['/home']),
          error: () => this.router.navigate(['/login'])
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
