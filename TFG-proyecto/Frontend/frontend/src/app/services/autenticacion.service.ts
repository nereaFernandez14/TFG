import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { FlashMessageService } from './flash-message.service';
import { UsuarioService, Usuario } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private readonly baseUrl = 'https://localhost:8443';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.obtenerUsuario());
  public usuario$ = this.usuarioSubject.asObservable();

  private rolSubject = new BehaviorSubject<string | null>(this.obtenerRolDesdeStorage());
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
        console.log('🟢 Respuesta del backend:', respuesta);

        if (respuesta && respuesta.role) {
          const usuario: Usuario = {
            id: respuesta.id,
            email: respuesta.email ?? email,
            nombre: respuesta.nombre ?? 'Usuario',
            apellidos: respuesta.apellidos ?? '',
            rol: respuesta.role.toLowerCase()
          };
          this.setUsuario(usuario);
        }
      })
    );
  }

  verificarSesion(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/rol`, { withCredentials: true }).pipe(
      tap((respuesta: any) => {
        console.log('🟡 Respuesta /api/rol:', respuesta);

        if (respuesta?.role) {
          const usuario = this.obtenerUsuario() || {} as Usuario;

          usuario.rol = respuesta.role.toLowerCase(); // ✅ string
          if (respuesta.nombre) usuario.nombre = respuesta.nombre;

          this.setUsuario(usuario);
        }
      })
    );
  }

  logout(): void {
    console.log('🚨 ENTRANDO A logout()');

    this.http.post(`${this.baseUrl}/api/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('✅ Logout exitoso');

        localStorage.removeItem('usuario');
        this.usuarioSubject.next(null);
        this.rolSubject.next(null);

        this.flashService.setMensaje('Has cerrado sesión correctamente');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('❌ Error al cerrar sesión:', err);
      }
    });
  }

  realizarLogoutRequest(): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/logout`, {}, { withCredentials: true });
  }

  obtenerCsrfToken(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/csrf`, { withCredentials: true });
  }

  private setUsuario(usuario: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
    this.rolSubject.next(usuario.rol ?? null);
  }

  obtenerUsuario(): Usuario | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  obtenerPerfilActual(): Usuario | null {
    return this.obtenerUsuario();
  }

  sincronizarPerfilConBackend(): void {
    const local = this.obtenerUsuario();
    if (!local) {
      console.warn('⚠️ No hay usuario local para sincronizar');
      return;
    }

    this.usuarioService.obtenerPerfil().subscribe({
      next: (remoto) => {
        const necesitaActualizar =
          local.nombre !== remoto.nombre ||
          local.apellidos !== remoto.apellidos;

        if (necesitaActualizar) {
          const usuarioActualizado: Usuario = {
            ...local,
            nombre: remoto.nombre,
            apellidos: remoto.apellidos,
            rol: remoto.rol.toLowerCase()
          };

          console.log('🔄 Actualizando perfil local con datos del backend', usuarioActualizado);
          this.setUsuario(usuarioActualizado);
        } else {
          console.log('✅ Perfil local ya está sincronizado con el backend');
        }
      },
      error: (err) => {
        console.error('❌ Error al sincronizar perfil con backend:', err);
      }
    });
  }

  private obtenerRolDesdeStorage(): string | null {
    const usuario = this.obtenerUsuario();
    return usuario?.rol ?? null;
  }

  obtenerRol(): string | null {
    return this.rolSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.obtenerRol();
  }

  prepararSesion(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/sesion`, {
      withCredentials: true
    });
  }

  actualizarRol(nuevoRol: string): void {
    const usuario = this.obtenerUsuario();
    if (usuario) {
      usuario.rol = nuevoRol;
      this.setUsuario(usuario);
    }
  }
}
