import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface ImagenRestaurante {
  id: number;
  nombreArchivo: string;
  tipo: string;
}

@Component({
  selector: 'app-modificar-imagenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modificar-imagenes.component.html',
  styleUrls: ['./modificar-imagenes.component.css']
})
export class ModificarImagenesComponent implements OnInit {
  restauranteId!: number;
  imagenesActuales: ImagenRestaurante[] = [];

  nuevasImagenes: File[] = [];
  nuevasImagenesPreview: string[] = [];
  nombresNuevasImagenes: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const parsed = JSON.parse(usuario);
      this.restauranteId = parsed.id;
      this.cargarImagenes();
    }
  }

  cargarImagenes(): void {
    this.http.get<ImagenRestaurante[]>(`/api/restaurantes/usuario/${this.restauranteId}/imagenes`)
.subscribe({
      next: (imagenes) => {
        this.imagenesActuales = imagenes;
      },
      error: (err) => console.error('❌ Error al cargar imágenes', err)
    });
  }

  eliminarImagen(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar esta imagen?')) return;

    this.http.delete(`/api/restaurantes/imagenes/${id}`).subscribe({
      next: () => {
        this.imagenesActuales = this.imagenesActuales.filter(img => img.id !== id);
        alert('✅ Imagen eliminada correctamente');
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
      this.nuevasImagenes = archivos;
      this.nombresNuevasImagenes = archivos.map(f => f.name);
      this.generarPrevisualizaciones();
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
    if (!this.nuevasImagenes.length) {
      alert('⚠️ No hay imágenes seleccionadas');
      return;
    }

    const formData = new FormData();
    this.nuevasImagenes.forEach(img => formData.append('imagenes', img));

    this.http.post(`/api/restaurantes/${this.restauranteId}/imagenes`, formData).subscribe({
      next: () => {
        alert('✅ Imágenes subidas correctamente');
        this.nuevasImagenes = [];
        this.nuevasImagenesPreview = [];
        this.nombresNuevasImagenes = [];
        this.cargarImagenes();
      },
      error: (err) => {
        console.error('❌ Error al subir imágenes', err);
        alert('Error al subir las imágenes');
      }
    });
  }

  cancelar(): void {
    if (confirm('¿Cancelar los cambios?')) {
      this.router.navigate(['/dashboard']);
    }
  }

  esImagen(mime: string): boolean {
    return mime.startsWith('image/');
  }
}
