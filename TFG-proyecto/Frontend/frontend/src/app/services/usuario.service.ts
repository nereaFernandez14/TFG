import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; 

export interface UsuarioRegistro {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rolId: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = '/api';
   private apiUrlUsu = environment.apiUrl + '/usuarios';
  

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo usuario.
   * POST /api/register (redirigido por proxy)
   */
  registrar(usuario: UsuarioRegistro): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, usuario).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene los datos del usuario autenticado
   * GET /api/perfil
   */
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil`, {
      withCredentials: true
    });
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    console.error('UsuarioService error ❌', error);
    return throwError(() =>
      new Error(error.error?.message || 'Error inesperado en el registro.')
    );
  }

  cambiarPassword(passwordActual: string, nuevaPassword: string): Observable<any> {
    return this.http.post('/api/change-password', {
      currentPassword: passwordActual,
      newPassword: nuevaPassword
    }, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

}
