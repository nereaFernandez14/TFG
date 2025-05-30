// src/app/services/restaurante-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RestauranteDashboardDatos {
  visitas: number;
  comentarios: number;
  valoracionPromedio: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestauranteDashboardService {
  private apiUrl = 'http://localhost:8080/api/restaurantes/dashboard';

  constructor(private http: HttpClient) {}

  obtenerResumen(idRestaurante: number): Observable<RestauranteDashboardDatos> {
    return this.http.get<RestauranteDashboardDatos>(`${this.apiUrl}/${idRestaurante}`);
  }
}
