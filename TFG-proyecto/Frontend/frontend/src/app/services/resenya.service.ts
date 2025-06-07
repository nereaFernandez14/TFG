// src/app/services/resenya.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resenya } from '../models/resenya.model';

@Injectable({ providedIn: 'root' })
export class ResenyaService {
  private baseUrl = 'https://localhost:8443';

  constructor(private http: HttpClient) {}

  /**
   * Crea una nueva reseña con imágenes (FormData)
   */
  crearResenya(formData: FormData): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(
      `${this.baseUrl}/resenyas`,
      formData,
      { withCredentials: true }
    );
  }

  /**
   * Verifica si el usuario ya hizo una reseña para ese restaurante
   */
  usuarioYaHaResenyado(restauranteId: number): Observable<{ yaExiste: boolean }> {
    return this.http.get<{ yaExiste: boolean }>(
      `${this.baseUrl}/resenyas/usuario/${restauranteId}`,
      { withCredentials: true }
    );
  }

  /**
   * Obtiene reseñas de un restaurante específico (solo lectura)
   */
  obtenerResenyasPorRestaurante(restauranteId: number): Observable<Resenya[]> {
    return this.http.get<Resenya[]>(
      `${this.baseUrl}/restaurantes/${restauranteId}/resenas`,
      { withCredentials: true }
    );
  }

  /**
   * Obtiene la imagen asociada a una reseña por ID
   */
  obtenerImagen(idImagen: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/imagenes/${idImagen}`, {
      responseType: 'blob',
      withCredentials: true
    });
  }
  /**
 * Reseñas hechas por usuarios al restaurante del usuario autenticado
 */
    obtenerMisResenyas(): Observable<Resenya[]> {
    return this.http.get<Resenya[]>(
            `${this.baseUrl}/restaurantes/mis-resenyas`,
            { withCredentials: true }
        );
    }
    // obtenerResenyasDeRestaurante
    obtenerResenyasDeRestaurante(idRestaurante: number): Observable<Resenya[]> {
        return this.http.get<Resenya[]>(`${this.baseUrl}/restaurantes/${idRestaurante}/resenas`, { withCredentials: true });
    }
    enviarDenuncia(resenyaId: number): Observable<any> {
        return this.http.post(`/api/resenyas/${resenyaId}/denunciar`, {});
    }


}
