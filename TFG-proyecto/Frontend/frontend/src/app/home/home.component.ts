import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { RestauranteService } from '../services/restaurante.service';
import { Restaurante } from '../models/restaurante.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlashMessageService } from '../services/flash-message.service';
import { RolNombre } from '../models/enums/RolNombre.enum';
import { TipoCocina } from '../models/enums/tipo-cocina.enum';
import { Barrio } from '../models/enums/barrio.enum';
import { RangoPrecio } from '../models/enums/rango-precio.enum';
import { RestriccionDietetica } from '../models/enums/restriccion-dietetica.enum';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  usuarioEmail: string = '';
  searchQuery: string = '';
  restaurantes: Restaurante[] = [];
  mensajeLogout: string | null = null;
  restriccionesAbierto: boolean = false;
  busquedaRealizada: boolean = false;


  // Enums para filtros
  tiposCocina = Object.values(TipoCocina);
  barrios = Object.values(Barrio);
  rangosPrecio = Object.values(RangoPrecio);
  restricciones = Object.values(RestriccionDietetica);

  // 🆕 Filtros completos
  filtros = {
    tipoCocina: '',
    barrio: '',
    rangoPrecio: '',
    restricciones: [] as string[]
  };

  destacados = [
    {
      nombre: 'Pizzería Bella',
      descripcion: 'Auténtica pizza napolitana en el centro'
    },
    {
      nombre: 'Sushi Tokyo',
      descripcion: 'Experiencia japonesa premium'
    }
  ];

  constructor(
    private autenticacionService: AutenticacionService,
    private router: Router,
    private restauranteService: RestauranteService,
    private flashService: FlashMessageService
  ) {}

  ngOnInit(): void {
    this.flashService.mensaje$.subscribe((mensaje) => {
      if (mensaje) {
        this.mensajeLogout = mensaje;
        setTimeout(() => (this.mensajeLogout = null), 5000);
      }
    });

    const usuario = this.autenticacionService.obtenerUsuario();
    if (!usuario) return;

    switch (usuario.rol) {
      case RolNombre.RESTAURANTE:
        this.router.navigate(['/restaurante']);
        break;
      case RolNombre.USUARIO:
        this.usuarioEmail = usuario.email || 'Desconocido';
        break;
    }
  }

  logout() {
    this.autenticacionService.logout();
    this.router.navigate(['/login']);
  }

  // 🔍 Combina búsqueda por nombre y filtros
  buscar() {
    console.log('➡️ Filtros aplicados:', this.filtros);

    this.busquedaRealizada = true; // ⬅️ Marcamos que el usuario hizo búsqueda

    this.restauranteService.filtrarRestaurantesAvanzado(
      this.filtros.tipoCocina || null,
      this.filtros.barrio || null,
      this.filtros.rangoPrecio || null,
      null,
      this.filtros.restricciones
    ).subscribe({
      next: (data) => {
        this.restaurantes = data;
        console.log('✅ Resultados:', data);
      },
      error: (err) => {
        console.error('❌ Error al buscar restaurantes:', err);
      }
    });
  }

  // ✅ Checkbox handler para restricciones
  onCheckboxChange(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.filtros.restricciones.push(value);
    } else {
      this.filtros.restricciones = this.filtros.restricciones.filter(r => r !== value);
    }
  }

  toggleRestricciones() {
    this.restriccionesAbierto = !this.restriccionesAbierto;
  }

}
