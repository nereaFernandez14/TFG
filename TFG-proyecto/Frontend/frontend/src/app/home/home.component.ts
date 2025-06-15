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
import { UsuarioService } from '../services/usuario.service';
import { FormatearRestriccionPipe } from '../pipes/formatearRestriccion.pipe';
import { FormatearRangoPrecioPipe } from '../pipes/formatearRangoPrecio.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, FormatearRestriccionPipe, FormatearRangoPrecioPipe],
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
  mostrarFormularioResena: boolean = false;

  // 🆕 Preferencias cargadas del usuario (solo para autofiltrado inicial)
  preferenciasUsuario: string[] = [];

  tiposCocina = Object.values(TipoCocina);
  barrios = Object.values(Barrio);
  rangosPrecio = Object.values(RangoPrecio);
  restricciones = Object.values(RestriccionDietetica);

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
    private usuarioService: UsuarioService,
    private restauranteService: RestauranteService,
    private router: Router,
    private flashService: FlashMessageService
  ) {}

  ngOnInit(): void {
    this.mostrarFormularioResena = this.autenticacionService.isAuthenticated();

    this.flashService.mensaje$.subscribe((mensaje) => {
      if (mensaje) {
        this.mensajeLogout = mensaje;
        setTimeout(() => (this.mensajeLogout = null), 5000);
      }
    });

    const usuario = this.autenticacionService.obtenerUsuario();
    if (!usuario) return;

    if (usuario.rol === RolNombre.RESTAURANTE) {
      this.router.navigate(['/restaurante']);
      return;
    }

    if (usuario.rol === RolNombre.USUARIO) {
      this.usuarioEmail = usuario.email || 'Desconocido';
      // 🆕 Cargar preferencias desde el perfil
      this.usuarioService.obtenerPerfil().subscribe({
        next: (data) => {
          if (data.restriccionesDieteticas?.length) {
            this.preferenciasUsuario = [...data.restriccionesDieteticas];
            this.buscarConPreferencias();
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener perfil del usuario', err);
        }
      });
    }
  }

  logout() {
    this.autenticacionService.logout();
    this.router.navigate(['/login']);
  }

  // 🔍 Búsqueda normal ignorando preferencias
  buscar() {
    this.busquedaRealizada = true;

    this.restauranteService.filtrarRestaurantesAvanzado(
      this.filtros.tipoCocina || null,
      this.filtros.barrio || null,
      this.filtros.rangoPrecio || null,
      null,
      this.filtros.restricciones,
      this.searchQuery || null
    ).subscribe({
      next: (data) => {
        this.restaurantes = data;
        console.log('✅ Resultados búsqueda manual:', data);
      },
      error: (err) => {
        console.error('❌ Error al buscar restaurantes:', err);
      }
    });
  }

  // 🔍 Búsqueda automática con las preferencias del usuario
  buscarConPreferencias() {
    this.busquedaRealizada = true;

    this.restauranteService.filtrarRestaurantesAvanzado(
      null,
      null,
      null,
      null,
      this.preferenciasUsuario,
      null
    ).subscribe({
      next: (data) => {
        this.restaurantes = data;
        console.log('🎯 Resultados según preferencias:', data);
      },
      error: (err) => {
        console.error('❌ Error al buscar con preferencias del usuario', err);
      }
    });
  }

  // ✅ Checkbox de restricciones (manual)
  onCheckboxChange(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.filtros.restricciones.push(value);
    } else {
      this.filtros.restricciones = this.filtros.restricciones.filter(r => r !== value);
    }

    this.buscar(); // búsqueda normal
  }

  toggleRestricciones() {
    this.restriccionesAbierto = !this.restriccionesAbierto;
  }

  verPerfil(id: number): void {
    this.router.navigate(['/restaurantes', id]);
  }
}
