import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from '../services/autenticacion.service';
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

  constructor(
    private authService: AutenticacionService,
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
        } else {
          this.isAuthenticated.set(false);
          this.user.set(null);
          this.userName.set(null);
        }
      });
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
    this.router.navigate(['/restaurante/crear']);
  }
  cerrarSidebar(): void {
  this.sidebarOpen = false;
  }
}
