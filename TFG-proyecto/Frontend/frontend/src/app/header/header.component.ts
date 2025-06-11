import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from '../services/autenticacion.service';
import { RestauranteService } from '../services/restaurante.service';
import { NgZone } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = signal(false);
  userName = signal<string | null>(null);
  user = signal<Usuario | null>(null);
  sidebarOpen = false;

  esRestaurante = computed(() => {
    const rol = this.user()?.rol;
    return rol?.toUpperCase() === 'RESTAURANTE';
  });

  puedeRegistrarRestaurante = signal(false);

  constructor(
    private authService: AutenticacionService,
    private restauranteService: RestauranteService,
    public router: Router,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario) => {
      this.zone.run(() => {
        if (usuario) {
          this.isAuthenticated.set(true);
          this.user.set(usuario);
          this.userName.set(usuario.nombre ?? 'Usuario');

          if (usuario.rol?.toUpperCase() === 'RESTAURANTE') {
            this.comprobarEstadoRestaurante(usuario.id);
          } else {
            this.puedeRegistrarRestaurante.set(false);
          }
        } else {
          this.isAuthenticated.set(false);
          this.user.set(null);
          this.userName.set(null);
          this.puedeRegistrarRestaurante.set(false);
        }
      });
    });

    // 👂 Suscribirse a notificación de restaurante creado
    this.restauranteService.restauranteCreado$.subscribe((creado) => {
      if (creado && this.user()?.id) {
        this.comprobarEstadoRestaurante(this.user()!.id);
      }
    });
  }

  private comprobarEstadoRestaurante(idUsuario: number): void {
    this.restauranteService.obtenerRestaurantePorUsuario(idUsuario).subscribe({
      next: (restaurante) => {
        const registrado = restaurante && restaurante.id != null;
        this.puedeRegistrarRestaurante.set(!registrado);
      },
      error: (err) => {
        if (err.status === 404) {
          console.info("ℹ️ No hay restaurante, se puede registrar");
        } else {
          console.error("❌ Error inesperado consultando restaurante:", err);
        }
        this.puedeRegistrarRestaurante.set(true);
      }

    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
    this.sidebarOpen = false;
    this.router.navigate(['/home']);
  }

  irAlPerfil(): void {
    this.sidebarOpen = false;
    this.router.navigate(['/profile']);
  }

  navegarACrearRestaurante(): void {
    this.sidebarOpen = false;
    this.router.navigate(['/restaurantes/crear']);
  }

  cerrarSidebar(): void {
    this.sidebarOpen = false;
  }
}
