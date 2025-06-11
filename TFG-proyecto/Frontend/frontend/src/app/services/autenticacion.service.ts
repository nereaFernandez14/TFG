import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { FlashMessageService } from './flash-message.service';
import { UsuarioService, Usuario } from './usuario.service';
import { RolNombre } from '../models/enums/RolNombre.enum';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private readonly baseUrl = 'https://localhost:8443';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.obtenerUsuarioDesdeStorage());
  public usuario$ = this.usuarioSubject.asObservable();

  private rolSubject = new BehaviorSubject<RolNombre | null>(this.obtenerRolDesdeStorage());
  public rol$ = this.rolSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private flashService: FlashMessageService,
    private usuarioService: UsuarioService
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/login`, {
      username: email,
      password: password
    }, {
      withCredentials: true
    }).pipe(
      tap((respuesta: any) => {
        if (respuesta?.role) {
          const rol = this.mapearRol(respuesta.role);

          const usuario: Usuario = {
            id: respuesta.id,
            email: respuesta.email ?? email,
            nombre: respuesta.nombre ?? 'Usuario',
            apellidos: respuesta.apellidos ?? '',
            rol: rol
          };
          this.setUsuario(usuario);

          this.obtenerCsrfToken().subscribe({
            next: () => {
              console.log('✅ Token CSRF obtenido y almacenado por Angular');
              window.location.reload();
            },
            error: (err) => {
              console.error('❌ Error al obtener token CSRF', err);
            }
          });
        }
      })
    );
  }

  verificarSesion(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/rol`, { withCredentials: true }).pipe(
      tap((respuesta: any) => {
        if (respuesta?.role) {
          const usuario = this.usuarioActual() || {} as Usuario;
          usuario.rol = this.mapearRol(respuesta.role);
          if (respuesta.nombre) usuario.nombre = respuesta.nombre;

          this.setUsuario(usuario);
        }
      })
    );
  }

  logout(): void {
    this.usuarioService.logout().subscribe({
      next: () => {
        this.limpiarSesion();
        this.flashService.setMensaje('Has cerrado sesión correctamente');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('❌ Error al cerrar sesión:', err);
        this.limpiarSesion(); // 🔁 incluso si falla, limpiamos
        this.router.navigate(['/home']);
      }
    });
  }

  realizarLogoutRequest(): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/logout`, {}, { withCredentials: true });
  }

  obtenerCsrfToken(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/csrf`, { withCredentials: true });
  }

  prepararSesion(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/sesion`, {
      withCredentials: true
    });
  }

  sincronizarPerfilConBackend(): void {
    const local = this.usuarioActual();
    if (!local) return;

    this.usuarioService.obtenerPerfil().subscribe({
      next: (remoto) => {
        const necesitaActualizar =
          local.nombre !== remoto.nombre || local.apellidos !== remoto.apellidos;

        if (necesitaActualizar) {
          const usuarioActualizado: Usuario = {
            ...local,
            nombre: remoto.nombre,
            apellidos: remoto.apellidos,
            rol: this.mapearRol(remoto.rol)
          };

          this.setUsuario(usuarioActualizado);
        }
      },
      error: (err) => {
        console.error('❌ Error al sincronizar perfil con backend:', err);
      }
    });
  }

  private setUsuario(usuario: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
    this.rolSubject.next(usuario.rol ?? null);
  }

  private limpiarSesion(): void {
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
    this.rolSubject.next(null);
  }

  obtenerUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  usuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  obtenerRol(): RolNombre | null {
    return this.rolSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.obtenerRol();
  }

  actualizarRol(nuevoRol: string): void {
    const usuario = this.usuarioActual();
    if (usuario) {
      usuario.rol = this.mapearRol(nuevoRol);
      this.setUsuario(usuario);
    }
  }

  private obtenerUsuarioDesdeStorage(): Usuario | null {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) return null;

    const parseado = JSON.parse(usuario);
    parseado.rol = this.mapearRol(parseado.rol);
    return parseado;
  }

  private obtenerRolDesdeStorage(): RolNombre | null {
    const usuario = this.obtenerUsuarioDesdeStorage();
    return usuario?.rol ?? null;
  }

  private mapearRol(rol: string | undefined | null): RolNombre {
    if (!rol || typeof rol !== 'string') {
      console.warn(`⚠️ Rol inválido recibido: ${rol}. Se asignará 'USUARIO' por defecto.`);
      return RolNombre.USUARIO;
    }

    const rolFormateado = rol.toUpperCase();
    if (Object.values(RolNombre).includes(rolFormateado as RolNombre)) {
      return rolFormateado as RolNombre;
    } else {
      console.warn(`⚠️ Rol inválido recibido: ${rol}. Se asignará 'USUARIO' por defecto.`);
      return RolNombre.USUARIO;
    }
  }

  /**
   * ✅ NUEVO MÉTODO: comprobar si el usuario actual es el autor de una reseña
   */
  esAutorDeResena(emailAutor: string): boolean {
    const usuario = this.usuarioActual();
    return usuario?.email === emailAutor;
  }
}
