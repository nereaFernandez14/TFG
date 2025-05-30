import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
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
  restricciones = Object.values(RestriccionDietetica);
  private palabrasProhibidas = ['puta', 'mierda', 'cabrón', 'estúpido', 'idiota']; // Personalizable

  constructor(
    private fb: FormBuilder,
    private restauranteService: RestauranteService,
    private authService: AutenticacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.restauranteForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipoCocina: ['', Validators.required],
      tipoCocinaPersonalizado: [''],
      barrio: ['', Validators.required],
      rangoPrecio: ['', Validators.required],
      restriccionesDieteticas: [[]]
    });

    this.restauranteForm.get('tipoCocina')?.valueChanges.subscribe((value) => {
      const personalizadoCtrl = this.restauranteForm.get('tipoCocinaPersonalizado');
      if (value === TipoCocina.OTRO) {
        personalizadoCtrl?.setValidators([
          Validators.required,
          Validators.minLength(2),
          this.palabraProhibidaValidator(this.palabrasProhibidas)
        ]);
      } else {
        personalizadoCtrl?.clearValidators();
        personalizadoCtrl?.setValue('');
      }
      personalizadoCtrl?.updateValueAndValidity();
    });
  }

  private palabraProhibidaValidator(palabras: string[]): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      const valor = control.value.toLowerCase();
      const encontrada = palabras.find((p) => valor.includes(p));
      return encontrada ? { prohibido: true } : null;
    };
  }

  onSubmit(): void {
    if (this.restauranteForm.invalid) {
      this.restauranteForm.markAllAsTouched();
      return;
    }

    const formData = this.restauranteForm.value;
    const usuario = this.authService.obtenerUsuario();
    const idUsuario = usuario?.id;

    if (!idUsuario) {
      console.error('❌ Usuario no autenticado o ID no disponible');
      return;
    }

    this.restauranteService.crearRestaurante(formData, idUsuario).subscribe({
      next: () => {
        console.log('✅ Restaurante creado');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Error al crear restaurante:', err);
      }
    });
  }
}
