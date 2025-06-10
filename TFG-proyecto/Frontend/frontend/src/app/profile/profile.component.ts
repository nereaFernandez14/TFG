import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../services/usuario.service';
import { Router } from '@angular/router';
import { Restaurante } from '../models/restaurante.model';
import { RestauranteService } from '../services/restaurante.service';
import { RestriccionDietetica } from '../models/enums/restriccion-dietetica.enum';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usuario: Usuario | null = null;
  restaurante: Restaurante | null = null;
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';
  imagenesSeleccionadas: File[] = [];
  nombresImagenes: string[] = [];

  restriccionesEnum = Object.values(RestriccionDietetica);
  restriccionesSeleccionadas: string[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private restauranteService: RestauranteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data) => {
        this.usuario = data;

        // Si decides añadir el atributo restricciones al usuario, aquí puedes cargarlo
        // this.restriccionesSeleccionadas = data.restricciones || [];

        if (this.usuario.rol === 'RESTAURANTE') {
          this.restauranteService.obtenerRestaurantePorUsuario(this.usuario.id).subscribe({
            next: (restaurante) => {
              this.restaurante = restaurante;
            },
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
    const index = this.restriccionesSeleccionadas.indexOf(valor);
    if (index >= 0) {
      this.restriccionesSeleccionadas.splice(index, 1);
    } else {
      this.restriccionesSeleccionadas.push(valor);
    }
  }

  formatearRestriccion(valor: string): string {
    return valor
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  guardarPreferencias(): void {
    alert('✅ Preferencias guardadas: ' + this.restriccionesSeleccionadas.join(', '));
    // Aquí puedes añadir un POST al backend si decides persistir los datos
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
        console.log('🔒 Sesión cerrada desde perfil');
        localStorage.removeItem('usuario');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('❌ Error al cerrar sesión desde perfil', err);
        this.router.navigate(['/login']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
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
      next: (resp) => {
        console.log('📤 Archivo subido correctamente', resp);
        alert('Menú subido correctamente ✅');
      },
      error: (err) => {
        console.error('❌ Error al subir archivo', err);
        alert('Error al subir el menú ❌');
      }
    });
  }

  solicitarBaja(): void {
    if (!this.usuario) return;

    const rol = this.usuario.rol?.toLowerCase();
    const confirmar = confirm(`¿Seguro que deseas solicitar la baja de tu cuenta (${rol})? Será revisado por un administrador.`);
    if (!confirmar) return;

    this.usuarioService.solicitarBaja(this.usuario.id!).subscribe({
      next: () => {
        alert(`✅ Solicitud de baja como ${rol} enviada correctamente.`);
        this.usuario!.solicitaBaja = true;
      },
      error: (err) => {
        console.error('❌ Error al solicitar baja', err);
        alert('Ocurrió un error al enviar la solicitud ❌');
      }
    });
  }

  onImagenesSeleccionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenesSeleccionadas = Array.from(input.files);
      this.nombresImagenes = this.imagenesSeleccionadas.map(file => file.name);
    }
  }

  subirImagenes(event: Event): void {
    event.preventDefault();
    if (!this.usuario || this.imagenesSeleccionadas.length === 0) return;

    const formData = new FormData();
    this.imagenesSeleccionadas.forEach(file => {
      formData.append('imagenes', file);
    });
    formData.append('email', this.usuario.email);

    this.usuarioService.subirImagenes(formData).subscribe({
      next: () => {
        alert('✅ Imágenes subidas correctamente');
        this.nombresImagenes = [];
        this.imagenesSeleccionadas = [];
      },
      error: (err) => {
        console.error('❌ Error al subir imágenes', err);
        alert('Ocurrió un error al subir las imágenes');
      }
    });
  }
}
