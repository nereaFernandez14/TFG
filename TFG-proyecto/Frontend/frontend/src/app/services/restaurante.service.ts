import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Restaurante } from '../models/restaurante.model';

@Injectable({ providedIn: 'root' })
export class RestauranteService {
  private apiUrl = 'http://localhost:8080/api/restaurantes';

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
}
