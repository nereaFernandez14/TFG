import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Restaurante } from '../models/restaurante.model';
import { TipoCocina } from '../models/enums/tipo-cocina.enum';
import { Barrio } from '../models/enums/barrio.enum';
import { RangoPrecio } from '../models/enums/rango-precio.enum';
import { RestriccionDietetica } from '../models/enums/restriccion-dietetica.enum';

@Injectable({ providedIn: 'root' })
export class RestauranteService {
  private apiUrl = 'http://localhost:8080/api/restaurantes';

  constructor(private http: HttpClient) {}

  getRestaurantesDestacados(): Observable<Restaurante[]> {
    return this.http.get<Restaurante[]>(`${this.apiUrl}/destacados`);
  }

  buscarRestaurantes(nombre: string): Observable<Restaurante[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<Restaurante[]>(`${this.apiUrl}/buscar`, { params });
  }

  crearRestaurante(data: Restaurante, idUsuario: number): Observable<Restaurante> {
    const params = new HttpParams().set('idUsuario', idUsuario.toString());
    return this.http.post<Restaurante>(this.apiUrl, data, { params });
  }

  filtrarRestaurantesAvanzado(
    tipoCocina?: TipoCocina,
    barrio?: Barrio,
    rangoPrecio?: RangoPrecio,
    minPuntuacion?: number,
    restricciones?: RestriccionDietetica[]
  ): Observable<Restaurante[]> {
    let params = new HttpParams();

    if (tipoCocina) params = params.set('tipoCocina', tipoCocina);
    if (barrio) params = params.set('barrio', barrio);
    if (rangoPrecio) params = params.set('rangoPrecio', rangoPrecio);
    if (minPuntuacion !== undefined) params = params.set('minPuntuacion', minPuntuacion.toString());
    if (restricciones && restricciones.length > 0) {
      restricciones.forEach(r => {
        params = params.append('restricciones', r);
      });
    }

    return this.http.get<Restaurante[]>(`${this.apiUrl}/filtrar-avanzado`, { params });
  }
}
