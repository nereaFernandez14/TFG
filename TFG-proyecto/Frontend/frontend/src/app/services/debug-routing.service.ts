import { Injectable } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AutenticacionService } from './autenticacion.service';

@Injectable({ providedIn: 'root' })
export class DebugRoutingService {
  constructor(private router: Router, private authService: AutenticacionService) {
    this.setupRoutingLogs();
  }

  private setupRoutingLogs(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const rol = this.authService.obtenerRol();
        console.log(`🚦 [NAVIGATION START] → RUTA: ${event.url} | ROL ACTUAL: ${rol ?? 'visitante'}`);
      }

      if (event instanceof NavigationEnd) {
        console.log(`✅ [NAVIGATION END] → LLEGASTE A: ${event.url}`);
      }

      if (event instanceof NavigationCancel) {
        console.warn(`⛔ [NAVIGATION CANCELADA]: ${event.url}`);
      }

      if (event instanceof NavigationError) {
        console.error(`❌ [NAVIGATION ERROR]: ${event.error}`);
      }
    });
  }
}
