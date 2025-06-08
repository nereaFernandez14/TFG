import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resenya } from '../models/resenya.model';

@Injectable({ providedIn: 'root' })
export class ResenyaService {
  private baseUrl = '/api'; // ✅ Utiliza proxy

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
   * Obtiene reseñas públicas de un restaurante por ID
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
   * Obtiene reseñas asociadas al restaurante autenticado
   */
  obtenerMisResenyas(): Observable<Resenya[]> {
    return this.http.get<Resenya[]>(
      `${this.baseUrl}/restaurantes/mis-resenyas`,
      { withCredentials: true }
    );
  }

  /**
   * Versión redundante (puedes eliminar si no se usa)
   */
  obtenerResenyasDeRestaurante(idRestaurante: number): Observable<Resenya[]> {
    return this.http.get<Resenya[]>(
      `${this.baseUrl}/restaurantes/${idRestaurante}/resenas`,
      { withCredentials: true }
    );
  }

  /**
   * Denunciar una reseña (visible para el administrador)
   */
  denunciar(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/resenyas/${id}/denunciar`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Otra forma de denuncia (puedes unificar con `denunciar`)
   */
  enviarDenuncia(resenyaId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/resenyas/${resenyaId}/denunciar`,
      {},
      { withCredentials: true }
    );
  }
}
