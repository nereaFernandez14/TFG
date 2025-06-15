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

  // Validador síncrono para formato específico de email
  const formatoEmailValido = (control: AbstractControl): ValidationErrors | null => {
    const email = control.value || '';
    // Regex para validar email con dominio .com, .es, .net, .org o .edu
    const regex = /^[^\s@]+@[^\s@]+\.(com|es|net|org|edu)$/i;
    if (!email) return null; // no validar vacío, eso lo hace Validators.required
    return regex.test(email) ? null : { formatoEmailInvalido: true };
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
    email: ['', [Validators.required, formatoEmailValido], [emailNoRegistrado]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol: [RolNombre.USUARIO, Validators.required]
  });
}


  // Función para capitalizar la primera letra de cada palabra
  private capitalizarCadaPalabra(texto: string): string {
    return texto
      .split(' ')
      .filter(palabra => palabra.length > 0)
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

  onSubmit(): void {
    this.formSubmitted = false;
    this.errorMessage = null;

    // Normaliza nombre y apellidos antes de validar y enviar
    const nombreOriginal = this.registerForm.get('nombre')?.value || '';
    const apellidosOriginal = this.registerForm.get('apellidos')?.value || '';

    const nombre = this.capitalizarCadaPalabra(nombreOriginal);
    const apellidos = this.capitalizarCadaPalabra(apellidosOriginal);

    this.registerForm.get('nombre')?.setValue(nombre);
    this.registerForm.get('apellidos')?.setValue(apellidos);

    this.errorNombrePersonalizado = this.palabrasProhibidas.some(p => nombre.toLowerCase().includes(p)) ? 'El nombre contiene palabras no permitidas' : null;
    this.errorApellidosPersonalizado = this.palabrasProhibidas.some(p => apellidos.toLowerCase().includes(p)) ? 'Los apellidos contienen palabras no permitidas' : null;

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
