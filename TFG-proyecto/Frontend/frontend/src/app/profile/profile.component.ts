import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { UsuarioService, Usuario } from '../services/usuario.service';
import { RestauranteService } from '../services/restaurante.service';
import { Restaurante } from '../models/restaurante.model';
import { RestriccionDietetica } from '../models/enums/restriccion-dietetica.enum';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usuario: Usuario | null = null;
  restaurante: Restaurante | null = null;
  notificaciones: any[] = [];

  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';
  imagenesSeleccionadas: File[] = [];
  nombresImagenes: string[] = [];

  restriccionesEnum = Object.values(RestriccionDietetica);
  restriccionesSeleccionadas: string[] = [];

  mostrarVentanaModificacionUsuario: boolean = false;
  campoSeleccionadoUsuario: string = '';
  nuevoValorUsuario: string = '';
  botonUsuarioDeshabilitado: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private restauranteService: RestauranteService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data) => {
        this.usuario = data;

        // ✅ Cargar restricciones seleccionadas desde backend
        this.restriccionesSeleccionadas = data.restriccionesDieteticas || [];

        if (this.usuario.rol === 'RESTAURANTE') {
          this.restauranteService.obtenerRestaurantePorUsuario(this.usuario.id).subscribe({
            next: (r) => (this.restaurante = r),
            error: (err) => {
              console.error('❌ Error al cargar restaurante', err);
              this.restaurante = null;
            }
          });
        }
      },
      error: (err) => console.error('❌ Error al obtener perfil:', err)
    });
  }


  toggleRestriccion(valor: string): void {
    const idx = this.restriccionesSeleccionadas.indexOf(valor);
    if (idx >= 0) this.restriccionesSeleccionadas.splice(idx, 1);
    else this.restriccionesSeleccionadas.push(valor);
  }

  formatearRestriccion(valor: string): string {
    return valor.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  guardarPreferencias(): void {
    if (!this.usuario) return;

    this.usuarioService.actualizarPreferencias(this.usuario.id!, this.restriccionesSeleccionadas).subscribe({
      next: () => {
        alert('✅ Preferencias guardadas correctamente');
      },
      error: (err) => {
        console.error('❌ Error al guardar preferencias', err);
        alert('❌ No se pudieron guardar las preferencias');
      }
    });
  }


  irACambiarPassword(): void {
    this.router.navigate(['/change-password']);
  }

  irACrearRestaurante(): void {
    this.router.navigate(['/restaurante/crear']);
  }

  logout(): void {
    this.usuarioService.logout().subscribe({
      next: () => {
        localStorage.removeItem('usuario');
        this.router.navigate(['/login']);
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  onFileSelected(event: Event): void {
    const inp = event.target as HTMLInputElement;
    if (inp.files?.length) {
      this.archivoSeleccionado = inp.files[0];
      this.nombreArchivo = this.archivoSeleccionado.name;
    }
  }

  subirArchivo(event: Event): void {
    event.preventDefault();
    if (!this.archivoSeleccionado || !this.usuario) return;

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('email', this.usuario.email);

    this.usuarioService.subirMenu(formData).subscribe({
      next: () => alert('✅ Menú subido correctamente'),
      error: () => alert('❌ Error al subir el menú')
    });
  }

  solicitarBaja(): void {
    if (!this.usuario) return;
    const confirmar = confirm(`¿Seguro que deseas solicitar la baja de tu cuenta (${this.usuario.rol.toLowerCase()})?`);
    if (!confirmar) return;

    this.usuarioService.solicitarBaja(this.usuario.id!).subscribe({
      next: () => {
        alert('✅ Solicitud enviada correctamente.');
        this.usuario!.solicitaBaja = true;
      },
      error: () => alert('❌ Error al solicitar baja')
    });
  }

  onImagenesSeleccionadas(event: Event): void {
    const inp = event.target as HTMLInputElement;
    if (inp.files?.length) {
      this.imagenesSeleccionadas = Array.from(inp.files);
      this.nombresImagenes = this.imagenesSeleccionadas.map(f => f.name);
    }
  }

  subirImagenes(event: Event): void {
    event.preventDefault();
    if (!this.usuario || !this.imagenesSeleccionadas.length) return;

    const formData = new FormData();
    this.imagenesSeleccionadas.forEach(f => formData.append('imagenes', f));
    formData.append('email', this.usuario.email);

    this.usuarioService.subirImagenes(formData).subscribe({
      next: () => {
        alert('✅ Imágenes subidas correctamente');
        this.nombresImagenes = [];
        this.imagenesSeleccionadas = [];
      },
      error: () => alert('❌ Error al subir imágenes')
    });
  }

  abrirVentanaModificacionUsuario(): void {
    this.mostrarVentanaModificacionUsuario = true;
    this.campoSeleccionadoUsuario = '';
    this.nuevoValorUsuario = '';
    this.botonUsuarioDeshabilitado = false;
  }

  cerrarVentanaModificacionUsuario(): void {
    this.mostrarVentanaModificacionUsuario = false;
    this.campoSeleccionadoUsuario = '';
    this.nuevoValorUsuario = '';
    this.botonUsuarioDeshabilitado = false;
  }

  enviarModificacionUsuario(): void {
    const usuario = this.usuarioService.obtenerUsuario();
    const usuarioId = usuario?.id;

    if (!this.campoSeleccionadoUsuario || !usuarioId) {
      alert('⚠️ Faltan datos para enviar la solicitud');
      return;
    }

    const campo = this.campoSeleccionadoUsuario;
    const nuevo = this.nuevoValorUsuario?.trim();
    const actual = (this.usuario as any)[campo];

    if (!campo || !nuevo) {
      alert('⚠️ Selecciona un campo y un nuevo valor');
      return;
    }

    if (actual?.toString().trim().toLowerCase() === nuevo.toLowerCase()) {
      alert('⚠️ El nuevo valor no puede ser igual al actual');
      return;
    }

    const malasPalabras = ['xxx', 'tonto', 'idiota'];
    if (malasPalabras.some(p => nuevo.toLowerCase().includes(p))) {
      alert('🚫 Valor no permitido');
      return;
    }

    this.botonUsuarioDeshabilitado = true;

    const payload = { campo, nuevoValor: nuevo };
    const endpoint = usuario?.rol === 'RESTAURANTE'
      ? `/api/restaurantes/${usuarioId}/solicitar-modificacion`
      : `/api/usuarios/${usuarioId}/solicitar-modificacion`;

    this.http.post(endpoint, payload, { withCredentials: true }).subscribe({
      next: () => {
        alert('✅ Solicitud enviada al administrador');
        this.cerrarVentanaModificacionUsuario();
      },
      error: (err) => {
        console.error('❌ Error al enviar modificación', err);
        alert('❌ Error al enviar la solicitud');
        this.botonUsuarioDeshabilitado = false;
      }
    });
  }

}
