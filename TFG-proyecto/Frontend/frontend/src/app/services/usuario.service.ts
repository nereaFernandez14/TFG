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
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * 🔐 Registra un nuevo usuario
   * POST /api/register
   */
  registrar(usuario: UsuarioRegistro): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/register`, usuario, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  /**
   * 👤 Obtiene los datos del usuario autenticado desde el backend
   * GET /usuarios/perfil ✅ RUTA ACTUALIZADA
   */
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/perfil`, {
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
   * 📦 Obtiene el usuario actual desde localStorage
   */
  obtenerUsuario(): Usuario | null {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) as Usuario : null;
  }

  /**
   * 🔒 Cambia la contraseña del usuario autenticado
   * POST /change-password
   */
  cambiarPassword(passwordActual: string, nuevaPassword: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/change-password`,
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
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/logout`, {}, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
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

  /**
   * ❌ Solicita la baja del usuario
   */
  solicitarBaja(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/${id}/solicitar-baja`, {}, {
      withCredentials: true
    });
  }

  /**
   * 🖼️ Subida de imágenes para restaurante
   */
  subirImagenes(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/subir-imagenes`, formData, {
      withCredentials: true
    });
  }
  actualizarPreferencias(id: number, preferencias: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}/preferencias-dieteticas`, preferencias, {
      withCredentials: true
    });
  }


}
export { Usuario };
