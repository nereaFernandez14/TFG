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
    if (restaurante?.id) {
      this.dashboardService.obtenerResumen(restaurante.id).subscribe({
        next: (data) => (this.datos = data),
        error: (err) => console.error('❌ Error cargando resumen dashboard', err)
      });
    }
  }
}
