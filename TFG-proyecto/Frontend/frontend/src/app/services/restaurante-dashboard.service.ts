import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resenya } from '../models/resenya.model';

export interface RestauranteDashboardDatos {
  visitas: number;
  comentarios: number;
  valoracionPromedio: number;

  // 🆕 Añadimos los campos usados en el dashboard
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipoCocina?: string;
  tipoCocinaPersonalizado?: string;
  barrio?: string;
  rangoPrecio?: string;
  restricciones?: string[];
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

  obtenerMisComentarios(): Observable<Resenya[]> {
    return this.http.get<Resenya[]>(
      `${this.baseUrl}/mis-resenyas`,
      { withCredentials: true }
    );
  }

  solicitarBaja(idUsuario: number): Observable<any> {
    return this.http.post(`/api/restaurantes/${idUsuario}/solicitar-baja`, {}, {
      withCredentials: true
    });
  }
}
