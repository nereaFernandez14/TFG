import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestauranteDashboardService, RestauranteDashboardDatos } from '../services/restaurante-dashboard.service';
import { AutenticacionService } from '../services/autenticacion.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  datos!: RestauranteDashboardDatos;

  constructor(
    private dashboardService: RestauranteDashboardService,
    private authService: AutenticacionService
  ) {}

  ngOnInit(): void {
    const restaurante = this.authService.obtenerUsuario();
    console.log('🧠 Usuario actual:', restaurante); 
    if (restaurante?.id) {
      this.dashboardService.obtenerResumen(restaurante.id).subscribe({
        next: (data) => (this.datos = data),
        error: (err) => console.error('❌ Error cargando resumen dashboard', err)
      });
    }
  }
  pedirBajaRestaurante() {
    const confirmado = confirm('¿Estás seguro de que deseas solicitar la baja del restaurante?');
    if (!confirmado) return;

    const usuario = this.authService.obtenerUsuario();
    if (!usuario?.id) return;

    this.dashboardService.solicitarBaja(usuario.id).subscribe({
      next: () => alert('Solicitud de baja enviada al administrador ✅'),
      error: (err) => {
        console.error('❌ Error solicitando baja', err);
        alert('Ocurrió un error al solicitar la baja.');
      }
    });
  }


  
}
