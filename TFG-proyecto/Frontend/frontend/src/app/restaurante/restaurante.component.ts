import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  restricciones = Object.values(RestriccionDietetica);

  restauranteId!: number;

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
          this.initForm(usuario?.email); // 👉 Pasamos el email aquí
        }
      },
      error: (err) => {
        console.log('ℹ️ No existe restaurante, permitiendo creación');
        this.initForm(usuario?.email); // 👉 También lo pasamos aquí
      }
    });
  }

  private initForm(emailUsuario?: string): void {
    this.restauranteForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      email: [emailUsuario || '', [Validators.required, Validators.email]], // ✅ Email precargado
      tipoCocina: ['', Validators.required],
      tipoCocinaPersonalizado: [''],
      barrio: ['', Validators.required],
      rangoPrecio: ['', Validators.required],
      restriccionesDieteticas: [[]]
    });

    this.restauranteForm.get('tipoCocina')?.valueChanges.subscribe(value => {
      const personalizadoCtrl = this.restauranteForm.get('tipoCocinaPersonalizado');
      if (value === TipoCocina.OTRO) {
        personalizadoCtrl?.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        personalizadoCtrl?.clearValidators();
        personalizadoCtrl?.setValue(null);
      }
      personalizadoCtrl?.updateValueAndValidity();
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
