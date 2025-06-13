import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Restaurante } from '../models/restaurante.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  constructor(private http: HttpClient) {}

  // 🛡️ Recupera el token CSRF desde la cookie
  private getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (!match) throw new Error("CSRF token no encontrado en cookies");
    return decodeURIComponent(match[1]);
  }


  obtenerFavoritos(idUsuario: number): Observable<Restaurante[]> {
    return this.http.get<Restaurante[]>(`/api/usuarios/${idUsuario}/favoritos`, {
      withCredentials: true
    });
  }

  agregarFavorito(idUsuario: number, idRestaurante: number) {
    const csrf = this.getCsrfToken();
    return this.http.post(
      `/api/usuarios/${idUsuario}/favoritos/${idRestaurante}`,
      {},
      {
        withCredentials: true,
        headers: new HttpHeaders({
          'X-XSRF-TOKEN': csrf || ''
        })
      }
    );
  }

  eliminarFavorito(idUsuario: number, idRestaurante: number) {
    const csrf = this.getCsrfToken();
    return this.http.delete(
      `/api/usuarios/${idUsuario}/favoritos/${idRestaurante}`,
      {
        withCredentials: true,
        headers: new HttpHeaders({
          'X-XSRF-TOKEN': csrf || ''
        })
      }
    );
  }
}
