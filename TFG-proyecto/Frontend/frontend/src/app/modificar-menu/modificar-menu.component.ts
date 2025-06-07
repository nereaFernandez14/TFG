import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { RestauranteService } from '../services/restaurante.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-modificar-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-menu.component.html',
  styleUrls: ['./modificar-menu.component.css']
})
export class ModificarMenuComponent implements OnInit {
  menuUrl: string | null = null;
  archivoSeleccionado: File | null = null;
  mensaje = '';
  error = '';
  idUsuario!: number;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AutenticacionService,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();
    if (!usuario?.id) {
      this.error = 'No se pudo identificar al usuario';
      return;
    }

    this.idUsuario = usuario.id;

    this.restauranteService.obtenerRestaurantePorUsuario(this.idUsuario).subscribe({
      next: (restaurante) => {
        if (restaurante?.rutaMenu) {
          this.menuUrl = `${environment.apiUrl}/restaurantes/menus/${restaurante.rutaMenu}`;
        }
      },
      error: (err) => {
        console.error('❌ Error obteniendo restaurante:', err);
        this.error = 'Error al cargar el menú actual';
      }
    });
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  subirMenu() {
    this.mensaje = '';
    this.error = '';

    if (!this.archivoSeleccionado) {
      this.error = 'Debes seleccionar un archivo.';
      return;
    }

    const usuario = this.authService.obtenerUsuario();
    if (!usuario?.email) {
      this.error = 'Usuario no autenticado.';
      return;
    }

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('email', usuario.email); // 👈 usado solo para backend (no para generar ruta en front)

    this.usuarioService.subirMenu(formData).subscribe({
      next: () => {
        this.mensaje = '✅ Menú actualizado con éxito';
        // Actualizamos la vista:
        this.restauranteService.obtenerRestaurantePorUsuario(this.idUsuario).subscribe({
          next: (r) => {
            this.menuUrl = `${environment.apiUrl}/restaurantes/menus/${r.rutaMenu}`;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al subir menú:', err);
        this.error = 'Error al subir el menú';
      }
    });
  }
}
