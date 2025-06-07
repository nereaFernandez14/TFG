import { Component, OnInit } from '@angular/core';
import { Resenya } from '../models/resenya.model';
import { ResenyaService } from '../services/resenya.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { CommonModule } from '@angular/common'; // 👈 Necesario para directivas estructurales

@Component({
  selector: 'app-mis-resenyas',
  standalone: true,
  imports: [CommonModule], // 👈 Necesario para directivas estructurales
  templateUrl: './mis-resenyas.component.html',
  styleUrls: ['./mis-resenyas.component.css']
})

export class MisResenyasComponent implements OnInit {
  resenyas: Resenya[] = [];
  imagenesMap: { [resenyaId: number]: string[] } = {};
  idRestaurante!: number;

  constructor(
    private resenyaService: ResenyaService,
    private authService: AutenticacionService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();

    if (usuario?.id) {
      this.idRestaurante = usuario.id;

      this.resenyaService.obtenerResenyasDeRestaurante(this.idRestaurante).subscribe({
        next: (resenyas) => {
          this.resenyas = resenyas;

          // Cargar imágenes de cada reseña
          resenyas.forEach((res) => {
            if (res.imagenes && res.imagenes.length > 0) {
              this.imagenesMap[res.id!] = [];

              res.imagenes.forEach((imagen) => {
                this.resenyaService.obtenerImagen(imagen.id!).subscribe({
                  next: (blob) => {
                    const url = URL.createObjectURL(blob);
                    this.imagenesMap[res.id!].push(url);
                  },
                  error: (err) => {
                    console.error(`❌ Error cargando imagen con ID ${imagen.id}:`, err);
                  }
                });
              });
            }
          });
        },
        error: (err) => {
          console.error('❌ Error cargando reseñas del restaurante:', err);
        }
      });
    }
  }
  denunciarResenya(resenya: Resenya): void {
    if (!resenya.id) return;

    const confirmado = confirm(`¿Estás seguro de que quieres denunciar este comentario?\n\n"${resenya.contenido}"`);
    if (!confirmado) return;

    this.resenyaService.enviarDenuncia(resenya.id).subscribe({
      next: () => alert('✅ Denuncia enviada al administrador'),
      error: (err) => {
        console.error('❌ Error al enviar denuncia:', err);
        alert('❌ Hubo un error al enviar la denuncia');
      }
    });
  }

}
