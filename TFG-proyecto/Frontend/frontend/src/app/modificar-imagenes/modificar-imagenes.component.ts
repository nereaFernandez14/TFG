import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ImagenEventService } from '../services/imagen-event.service'; // <-- Importa el servicio

@Component({
  selector: 'app-modificar-imagenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modificar-imagenes.component.html',
  styleUrls: ['./modificar-imagenes.component.css']
})
export class ModificarImagenesComponent implements OnInit {
  imagenesActuales: string[] = [];
  nuevasImagenes: File[] = [];
  nombresNuevasImagenes: string[] = [];
  nuevasImagenesPreview: string[] = [];
  restauranteId!: number;
  imagenesUrl: string[] = [];
  botonDeshabilitado: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private imagenEventService: ImagenEventService // <-- Inyección
  ) {}

  ngOnInit(): void {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.restauranteId = usuario.id;
      this.cargarImagenes();
    }
  }

  cargarImagenes(): void {
    this.http.get<string[]>(`/api/restaurantes/${this.restauranteId}/imagenes`).subscribe({
      next: (nombres) => {
        this.imagenesActuales = nombres;
        const backend = 'https://localhost:8443';
        this.imagenesUrl = nombres.map(n =>
          `${backend}/restaurantes/uploads/${this.restauranteId}/${n}`
        );
      },
      error: (err) => console.error('❌ Error al cargar imágenes actuales', err)
    });
  }

  eliminarImagen(nombre: string): void {
    if (!confirm(`¿Eliminar imagen "${nombre}"?`)) return;

    this.http.delete(`/api/restaurantes/${this.restauranteId}/imagenes/${nombre}`).subscribe({
      next: () => {
        alert('✅ Imagen eliminada correctamente');
        this.imagenesActuales = this.imagenesActuales.filter(img => img !== nombre);
        this.imagenesUrl = this.imagenesUrl.filter(url => !url.includes(nombre));
        this.imagenEventService.emitirActualizacion(); // <--- Emitir evento
      },
      error: (err) => {
        console.error('❌ Error al eliminar imagen', err);
        alert('Error al eliminar la imagen');
      }
    });
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const archivos = Array.from(input.files);
      const tiposValidos = ['image/', 'video/'];
      const nuevasValidas: File[] = [];

      for (const archivo of archivos) {
        const tipo = archivo.type;
        const esValido = tiposValidos.some(prefix => tipo.startsWith(prefix));

        if (!esValido) {
          alert(`❌ Archivo "${archivo.name}" no es una imagen ni un vídeo válido`);
          continue;
        }

        // Comprobar duplicados estrictamente: nombre + tamaño
        const yaExisteEnNuevas = this.nuevasImagenes.some(img => img.name === archivo.name && img.size === archivo.size);
        const yaExisteEnActuales = this.imagenesActuales.some(imgNombre => imgNombre === archivo.name);

        if (yaExisteEnNuevas || yaExisteEnActuales) {
          alert(`⚠️ El archivo "${archivo.name}" ya está añadido o existe en el restaurante`);
          continue;
        }

        nuevasValidas.push(archivo);
      }

      this.nuevasImagenes.push(...nuevasValidas);
      this.nombresNuevasImagenes = this.nuevasImagenes.map(f => f.name);
      this.generarPrevisualizaciones();
      this.botonDeshabilitado = this.nuevasImagenes.length === 0;
    }
  }

  generarPrevisualizaciones(): void {
    this.nuevasImagenesPreview = [];

    for (const archivo of this.nuevasImagenes) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.nuevasImagenesPreview.push(e.target.result);
      };
      reader.readAsDataURL(archivo);
    }
  }

  subirNuevasImagenes(): void {
    if (this.botonDeshabilitado) {
      alert('⚠️ No hay imágenes o vídeos seleccionados');
      return;
    }

    const formData = new FormData();
    this.nuevasImagenes.forEach(img => formData.append('imagenes', img));

    this.http.post(`/api/restaurantes/${this.restauranteId}/imagenes`, formData, {
      responseType: 'json'
    }).subscribe({
      next: () => {
        alert('✅ Imágenes/Vídeos subidos correctamente');
        this.nuevasImagenes = [];
        this.nuevasImagenesPreview = [];
        this.nombresNuevasImagenes = [];
        this.botonDeshabilitado = true;
        this.cargarImagenes();
        this.imagenEventService.emitirActualizacion(); // <--- Emitir evento
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Error al subir imágenes/vídeos', err);
        alert('Error al subir los archivos');
      }
    });
  }

  cancelar(): void {
    if (confirm('¿Estás seguro de cancelar los cambios?')) {
      this.nuevasImagenes = [];
      this.nuevasImagenesPreview = [];
      this.nombresNuevasImagenes = [];
      this.botonDeshabilitado = true;
      this.router.navigate(['/dashboard']);
    }
  }

  esImagen(preview: string): boolean {
    return preview.startsWith('data:image');
  }
}
