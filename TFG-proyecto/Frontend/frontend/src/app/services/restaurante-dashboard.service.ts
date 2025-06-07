import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RestauranteDashboardDatos {
  visitas: number;
  comentarios: number;
  valoracionPromedio: number;
}

@Injectable({ providedIn: 'root' })
export class RestauranteDashboardService {
  private baseUrl = 'http://localhost:8443/api/restaurantes';

  constructor(private http: HttpClient) {}

  obtenerResumen(idUsuario: number): Observable<RestauranteDashboardDatos> {
    return this.http.get<RestauranteDashboardDatos>(`${this.baseUrl}/resumen/${idUsuario}`);
  }
}
