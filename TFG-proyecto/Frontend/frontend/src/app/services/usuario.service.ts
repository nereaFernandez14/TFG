import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RolNombre } from '../models/enums/RolNombre.enum';
import { Usuario } from '../models/usuario.model';

export interface UsuarioRegistro {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol: string; // El front envía string
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo usuario.
   * POST /api/register
   */
  registrar(usuario: UsuarioRegistro): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, usuario, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene los datos del usuario autenticado.
   * GET /api/perfil
   */
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil`, {
      withCredentials: true
    }).pipe(
      map((usuario: any) => ({
        ...usuario,
        rol: RolNombre[usuario.rol as keyof typeof RolNombre]
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * POST /change-password
   */
  cambiarPassword(passwordActual: string, nuevaPassword: string): Observable<any> {
  return this.http.post(
    `${environment.apiUrl}/change-password`,
    {
      currentPassword: passwordActual,
      newPassword: nuevaPassword
    },
    {
      withCredentials: true,
      responseType: 'json'
    }
  );
}

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }

  /**
   * Cierra la sesión del usuario autenticado.
   * POST /api/logout
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Manejo centralizado de errores HTTP.
   */
  private handleError(error: HttpErrorResponse) {
    console.error('UsuarioService error ❌', error);
    return throwError(() =>
      new Error(error.error?.message || 'Error inesperado en la petición.')
    );
  }

  
  subirMenu(formData: FormData) {
      return this.http.post(`${environment.apiUrl}/restaurantes/subir-menu`, formData, {
      withCredentials: true
    });
  }
  solicitarBaja(id: number) {
    return this.http.post(`${this.apiUrl}/usuarios/${id}/solicitar-baja`, {}, {
      withCredentials: true
    });

  }
  subirImagenes(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/subir-imagenes`, formData, {
      withCredentials: true
    });
  }

}
export { Usuario };
