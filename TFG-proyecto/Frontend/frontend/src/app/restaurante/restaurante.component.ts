import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RestauranteService } from '../services/restaurante.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { TipoCocina } from '../models/enums/tipo-cocina.enum';
import { Barrio } from '../models/enums/barrio.enum';
import { RangoPrecio } from '../models/enums/rango-precio.enum';
import { RestriccionDietetica } from '../models/enums/restriccion-dietetica.enum';
import { HttpClient } from '@angular/common/http';
import { FormatearRangoPrecioPipe } from '../pipes/formatearRangoPrecio.pipe';
import { FormatearRestriccionPipe } from '../pipes/formatearRestriccion.pipe';

@Component({
  selector: 'app-restaurante',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormatearRangoPrecioPipe, FormatearRestriccionPipe],
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
      nombre: ['', [Validators.required, this.sinPalabrasMalSonantes.bind(this)]],
      direccion: ['', [Validators.required, this.validarDireccionEspRegex, this.sinPalabrasMalSonantes.bind(this)]],
      telefono: ['', [Validators.required, this.validarTelefonoRegex, this.sinPalabrasMalSonantes.bind(this)]],
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

    this.aplicarFormateoTexto();
  }

  sinPalabrasMalSonantes(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const texto = control.value.toLowerCase();
    const contiene = this.palabrasProhibidas.some(p => texto.includes(p));
    return contiene ? { malsonante: true } : null;
  }

  formatoEmailValidoRegex(control: AbstractControl): ValidationErrors | null {
    const email = control.value || '';
    if (!email) return null;
    const regex = /^[^\s@]+@[^\s@]+\.(com|es|net|org|edu)$/i;
    return regex.test(email) ? null : { formatoEmailInvalido: true };
  }

  validarDireccionEspRegex(control: AbstractControl): ValidationErrors | null {
    const direccion = control.value || '';
    if (!direccion) return null;

    const regexDireccion = /^[\wÁÉÍÓÚáéíóúÑñ\s\.\-ºª]+ \d+(,\s*piso\s*\d+)?(,[^,]+)*,\s*[\wÁÉÍÓÚáéíóúÑñ\s]+,\s*\d{5}$/i;

    return regexDireccion.test(direccion.trim()) ? null : { direccionInvalida: true };
  }

  validarTelefonoRegex(control: AbstractControl): ValidationErrors | null {
    const telefono = control.value || '';
    if (!telefono) return null;
    const regexMovil = /^[6789]\d{8}$/;
    const regexFijo = /^0?[89]\d{7}$/;
    return regexMovil.test(telefono) || regexFijo.test(telefono) ? null : { telefonoInvalido: true };
  }

  private formatearPalabra(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  private aplicarFormateoTexto(): void {
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

  onSubmit(): void {
    if (this.restauranteForm.invalid) {
      this.restauranteForm.markAllAsTouched();
      return;
    }

    const formData = this.restauranteForm.value;

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
