import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MensajeService } from './services/mensaje.service';
import { AutenticacionService } from './services/autenticacion.service';
import { DebugRoutingService } from './services/debug-routing.service';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>

    <div class="mensajes" *ngIf="mensajes.length > 0; else noMensajes">
      <h2>Mensajes desde el backend:</h2>
      <ul>
        <li *ngFor="let mensaje of mensajes">
          {{ mensaje.contenido || mensaje }}
        </li>
      </ul>
    </div>

    <ng-template #noMensajes>
      <p>No hay mensajes disponibles o no estás autenticado.</p>
    </ng-template>
  `
})
export class AppComponent implements OnInit {
  private readonly mensajeService = inject(MensajeService);
  private readonly authService = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly debugRouting = inject(DebugRoutingService);

  mensajes: any[] = [];

  ngOnInit(): void {
    this.authService.prepararSesion().subscribe({
      next: () => {
        const usuario = this.authService.obtenerUsuario();
        const rol = this.authService.obtenerRol();

        if (!usuario) {
          console.log("🟢 Visitante: no autenticado, sesión iniciada.");
          this.mensajes = [];
          return;
        }

        this.authService.verificarSesion().subscribe({
          next: () => {
            console.log(`🔐 Usuario autenticado como ${rol}`);
            this.mensajeService.obtenerMensajes().subscribe({
              next: (data) => {
                this.mensajes = Array.isArray(data) ? data : Object.values(data);
              },
              error: () => {
                console.warn('❌ No se pudieron cargar los mensajes.');
              }
            });
          },
          error: () => {
            console.warn("🔒 Usuario no autenticado. Borramos sesión local.");
            this.authService.logout();
            this.mensajes = [];
          }
        });
      },
      error: () => {
        console.warn("⚠️ No se pudo preparar la sesión.");
      }
    });
  }
}
