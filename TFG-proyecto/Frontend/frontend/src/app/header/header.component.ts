
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from '../services/autenticacion.service';
import { NgZone } from '@angular/core';
import { Component, OnInit, signal, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() mostrarLogin = new EventEmitter<void>();
  @Output() mostrarRegistro = new EventEmitter<void>();

  isAuthenticated = signal(false);
  userName = signal<string | null>(null);
  sidebarOpen = false;

  constructor(
    private authService: AutenticacionService,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario) => {
      // Aseguramos que Angular actualice el DOM y detecte el cambio
      this.zone.run(() => {
        if (usuario) {
          console.log('✅ Usuario autenticado en Header:', usuario);
          this.isAuthenticated.set(true);
          this.userName.set(usuario.nombre ?? 'Usuario');
        } else {
          console.warn('⚠️ No hay usuario autenticado en Header');
          this.isAuthenticated.set(false);
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
    console.log('👤 Navegando a /profile desde Header. URL actual:', this.router.url);

    // 🔄 Forzar navegación incluso si ya estamos en profile
    if (this.router.url === '/profile') {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/profile']);
      });
    } else {
      this.router.navigate(['/profile']);
          }
  }
  abrirLogin(): void {
  this.mostrarLogin.emit();
}

  abrirRegistro(): void {
  this.mostrarRegistro.emit();
}

}
