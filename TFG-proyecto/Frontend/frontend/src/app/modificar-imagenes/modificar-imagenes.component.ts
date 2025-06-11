import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  restauranteId!: number;

  constructor(private http: HttpClient, private router: Router) {}

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
      next: (data) => this.imagenesActuales = data,
      error: (err) => console.error('❌ Error al cargar imágenes actuales', err)
    });
  }

  eliminarImagen(nombre: string): void {
    const confirmar = confirm(`¿Eliminar imagen "${nombre}"?`);
    if (!confirmar) return;

    this.http.delete(`/api/restaurantes/${this.restauranteId}/imagenes/${nombre}`).subscribe({
      next: () => {
        alert('✅ Imagen eliminada correctamente');
        this.imagenesActuales = this.imagenesActuales.filter(img => img !== nombre);
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
      this.nuevasImagenes = Array.from(input.files);
      this.nombresNuevasImagenes = this.nuevasImagenes.map(f => f.name);
    }
  }

  subirNuevasImagenes(): void {
    if (!this.nuevasImagenes.length) {
      alert('⚠️ No hay imágenes seleccionadas');
      return;
    }

    const formData = new FormData();
    this.nuevasImagenes.forEach(img => formData.append('imagenes', img));

    this.http.post(`/api/restaurantes/${this.restauranteId}/imagenes`, formData, {
    responseType: 'json' // 👈 asegura que Angular no espere texto plano
    }).subscribe({
        next: () => {
            alert('✅ Imágenes subidas correctamente');
            this.nuevasImagenes = [];
            this.nombresNuevasImagenes = [];
            this.cargarImagenes(); // recarga la lista
        },
        error: (err) => {
            console.error('❌ Error al subir imágenes', err);
            alert('Error al subir las nuevas imágenes');
        }
        });
  }
}
