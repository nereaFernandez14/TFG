import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Restaurante } from '../models/restaurante.model';

@Injectable({ providedIn: 'root' })
export class RestauranteService {
  private apiUrl = '/api/restaurantes';

  // 🟢 NUEVO: Notificador reactivo de creación de restaurante
  private restauranteCreadoSubject = new BehaviorSubject<boolean>(false);
  restauranteCreado$ = this.restauranteCreadoSubject.asObservable();

  constructor(private http: HttpClient) {}

  getRestaurantesDestacados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/destacados`);
  }

  buscarRestaurantes(nombre: string): Observable<Restaurante[]> {
    return this.http.get<Restaurante[]>(
      `${this.apiUrl}/buscar?nombre=${encodeURIComponent(nombre)}`
    );
  }

  crearRestaurante(data: any, idUsuario: number): Observable<Restaurante> {
    const params = new HttpParams().set('idUsuario', idUsuario.toString());
    return this.http.post<Restaurante>(`${this.apiUrl}`, data, { params });
  }

  obtenerRestaurantePorUsuario(idUsuario: number): Observable<Restaurante> {
    return this.http.get<Restaurante>(`/api/restaurantes/mio`, {
      params: new HttpParams().set('idUsuario', idUsuario.toString()),
      withCredentials: true 
    });
  }


  obtenerRestaurantePorId(id: number): Observable<Restaurante> {
    return this.http.get<Restaurante>(`${this.apiUrl}/${id}`);
  }

  // ✅ Método para notificar la creación del restaurante
  notificarRestauranteCreado() {
    this.restauranteCreadoSubject.next(true);
  }
  filtrarRestaurantesAvanzado(
    tipoCocina: string | null,
    barrio: string | null,
    rangoPrecio: string | null,
    minPuntuacion: number | null,
    restricciones: string[],
    nombre: string | null
  ): Observable<Restaurante[]> {
    const params: any = {};

    if (tipoCocina) params.tipoCocina = tipoCocina;
    if (barrio) params.barrio = barrio;
    if (rangoPrecio) params.rangoPrecio = rangoPrecio;
    if (minPuntuacion !== null && minPuntuacion !== undefined) {
      params.minPuntuacion = minPuntuacion;
    }
    if (restricciones && restricciones.length > 0) {
      params.restricciones = restricciones;
    }
    if (nombre) params.nombre = nombre; 

    return this.http.get<Restaurante[]>('/api/restaurantes/filtrar-avanzado', {
      params,
      withCredentials: true
    });
  }


}
