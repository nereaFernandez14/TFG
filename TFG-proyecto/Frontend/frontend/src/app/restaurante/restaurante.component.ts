import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RestauranteService } from '../services/restaurante.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { TipoCocina } from '../models/enums/tipo-cocina.enum';
import { Barrio } from '../models/enums/barrio.enum';
import { RangoPrecio } from '../models/enums/rango-precio.enum';
import { RestriccionDietetica } from '../models/enums/restriccion-dietetica.enum';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-restaurante',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './restaurante.component.html',
  styleUrls: ['./restaurante.component.css']
})
export class RestauranteComponent implements OnInit {
  restauranteForm!: FormGroup;

  tiposCocina = Object.values(TipoCocina);
  barrios = Object.values(Barrio);
  rangosPrecio = Object.values(RangoPrecio);
  restricciones = Object.values(RestriccionDietetica).filter(r => r.toUpperCase() !== 'OTRO');

  restauranteId!: number;
  palabrasProhibidas = ['puta', 'mierda', 'gilipollas', 'imbécil', 'estúpido'];

  constructor(
    private fb: FormBuilder,
    private restauranteService: RestauranteService,
    private authService: AutenticacionService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();
    const idUsuario = usuario?.id;

    if (!idUsuario) {
      console.error('❌ Usuario no autenticado o ID no disponible');
      this.router.navigate(['/login']);
      return;
    }

    this.restauranteService.obtenerRestaurantePorUsuario(idUsuario).subscribe({
      next: (restaurante) => {
        if (restaurante && restaurante.id) {
          this.restauranteId = restaurante.id;
          this.router.navigate(['/dashboard']);
        } else {
          this.initForm(usuario?.email);
        }
      },
      error: () => {
        this.initForm(usuario?.email);
      }
    });
  }

  private initForm(emailUsuario?: string): void {
    this.restauranteForm = this.fb.group({
      nombre: ['', [Validators.required]],
      direccion: ['', [Validators.required, this.validarDireccionEspRegex]],
      telefono: ['', [Validators.required, this.validarTelefonoRegex]],
      email: [emailUsuario || '', [Validators.required, Validators.email, this.formatoEmailValidoRegex]],
      descripcion: ['', [Validators.required, this.sinPalabrasMalSonantes.bind(this)]],
      tipoCocina: ['', Validators.required],
      tipoCocinaPersonalizado: [''],
      barrio: ['', Validators.required],
      rangoPrecio: ['', Validators.required],
      restricciones: [[]]
    });

    // Validators dinámicos para tipoCocinaPersonalizado cuando es OTRO
    this.restauranteForm.get('tipoCocina')?.valueChanges.subscribe(value => {
      const ctrl = this.restauranteForm.get('tipoCocinaPersonalizado');
      if (value === TipoCocina.OTRO) {
        ctrl?.setValidators([Validators.required, Validators.minLength(2), this.sinPalabrasMalSonantes.bind(this)]);
      } else {
        ctrl?.clearValidators();
        ctrl?.setValue('');
      }
      ctrl?.updateValueAndValidity();
    });

    // Aplicar formateo a inputs de texto
    this.aplicarFormateoTexto();

    // Validar campos select para habilitar botón (puedes implementarlo en el template con un getter)
  }

  sinPalabrasMalSonantes(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const texto = control.value.toLowerCase();
    const contiene = this.palabrasProhibidas.some(p => texto.includes(p));
    return contiene ? { malsonante: true } : null;
  }

  // Email con regex para validar dominios .com, .es, .net, .org, .edu
  formatoEmailValidoRegex(control: AbstractControl): ValidationErrors | null {
    const email = control.value || '';
    if (!email) return null;
    const regex = /^[^\s@]+@[^\s@]+\.(com|es|net|org|edu)$/i;
    return regex.test(email) ? null : { formatoEmailInvalido: true };
  }

  // Dirección estándar España - regex básica: calle + número + CP 5 dígitos + localidad (simplificada)
  validarDireccionEspRegex(control: AbstractControl): ValidationErrors | null {
    const direccion = control.value || '';
    if (!direccion) return null;

    const regexDireccion = /^[\wÁÉÍÓÚáéíóúÑñ\s\.\-ºª]+ \d+[^\n,]*, [\wÁÉÍÓÚáéíóúÑñ\s]+, \d{5}$/;

    return regexDireccion.test(direccion.trim()) ? null : { direccionInvalida: true };
  }

  // Teléfono móvil o fijo España con regex
  validarTelefonoRegex(control: AbstractControl): ValidationErrors | null {
    const telefono = control.value || '';
    if (!telefono) return null;
    const regexMovil = /^[6789]\d{8}$/;
    const regexFijo = /^0?[89]\d{7}$/;
    return regexMovil.test(telefono) || regexFijo.test(telefono) ? null : { telefonoInvalido: true };
  }

  // Formatea una palabra: primera letra mayúscula, resto minúsculas
  private formatearPalabra(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  // Formateo para nombre (capitalizar cada palabra), y otros campos solo primera letra mayúscula
  private aplicarFormateoTexto(): void {
    // Capitalizar cada palabra para nombre
    this.restauranteForm.get('nombre')?.valueChanges.subscribe(val => {
      if (val) {
        const formateado = val
          .split(' ')
          .map((word: string) => this.formatearPalabra(word))
          .join(' ');
        if (val !== formateado) {
          this.restauranteForm.get('nombre')?.setValue(formateado, { emitEvent: false });
        }
      }
    });

    // Para direccion, descripcion, tipoCocinaPersonalizado y telefono: solo primera letra mayúscula
    ['direccion', 'descripcion', 'tipoCocinaPersonalizado', 'telefono'].forEach(campo => {
      this.restauranteForm.get(campo)?.valueChanges.subscribe(val => {
        if (val) {
          const formateado = this.formatearPalabra(val);
          if (val !== formateado) {
            this.restauranteForm.get(campo)?.setValue(formateado, { emitEvent: false });
          }
        }
      });
    });
  }

  // Añade más validaciones o helpers si deseas, por ejemplo, para activar el botón guardar

  onSubmit(): void {
    if (this.restauranteForm.invalid) {
      this.restauranteForm.markAllAsTouched();
      return;
    }

    const formData = this.restauranteForm.value;

    // Si no es OTRO, borrar tipoCocinaPersonalizado para evitar inconsistencias
    if (formData.tipoCocina !== TipoCocina.OTRO) {
      formData.tipoCocinaPersonalizado = null;
    }

    const usuario = this.authService.obtenerUsuario();
    const idUsuario = usuario?.id;

    if (!idUsuario) {
      console.error('❌ Usuario no autenticado o ID no disponible');
      return;
    }

    this.restauranteService.crearRestaurante(formData, idUsuario).subscribe({
      next: () => {
        console.log('✅ Restaurante creado correctamente');
        this.restauranteService.notificarRestauranteCreado();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Error al crear restaurante:', err);
      }
    });
  }
}
