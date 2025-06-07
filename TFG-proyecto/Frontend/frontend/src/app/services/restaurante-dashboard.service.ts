import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
  private baseUrl = 'https://localhost:8443/restaurantes';

  constructor(private http: HttpClient) {}

  obtenerResumen(idUsuario: number): Observable<RestauranteDashboardDatos> {
    return this.http.get<RestauranteDashboardDatos>(
      `${this.baseUrl}/resumen/${idUsuario}`,
      { withCredentials: true } // 👈 NECESARIO PARA ENVIAR COOKIES
    );
  }
}
