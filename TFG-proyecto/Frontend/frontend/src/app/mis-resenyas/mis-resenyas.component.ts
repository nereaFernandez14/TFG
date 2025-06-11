import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resenya } from '../models/resenya.model';
import { ResenyaService } from '../services/resenya.service';
import { AutenticacionService } from '../services/autenticacion.service';

@Component({
  selector: 'app-mis-resenyas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-resenyas.component.html',
  styleUrls: ['./mis-resenyas.component.css']
})
export class MisResenyasComponent implements OnInit {
  resenyas: Resenya[] = [];
  imagenesMap: { [resenyaId: number]: string[] } = {};
  cargando: boolean = true;

  constructor(
    private resenyaService: ResenyaService,
    private authService: AutenticacionService
  ) {}

  ngOnInit(): void {
    this.cargarMisResenyas();
  }

  cargarMisResenyas(): void {
    this.resenyaService.obtenerMisResenyas().subscribe({
      next: (resenyas) => {
        this.resenyas = resenyas || [];
        this.cargando = false;

        this.resenyas.forEach(res => {
          const id = res.id;
          if (id && res.imagenes?.length) {
            this.imagenesMap[id] = [];

            res.imagenes.forEach(imagen => {
              if (imagen.id) {
                this.resenyaService.obtenerImagen(imagen.id).subscribe({
                  next: (blob) => {
                    const url = URL.createObjectURL(blob);
                    this.imagenesMap[id].push(url);
                  },
                  error: (err) => {
                    console.error(`❌ Error al cargar imagen ID ${imagen.id}:`, err);
                  }
                });
              }
            });
          }
        });
      },
      error: (err) => {
        this.cargando = false;
        console.error('❌ Error al obtener tus reseñas:', err);
      }
    });
  }

  denunciarResenya(id: number): void {
    if (!id) return;

    this.resenyaService.denunciar(id).subscribe({
      next: () => {
        alert('🚨 La reseña fue denunciada correctamente.');
      },
      error: (err) => {
        console.error('❌ Error al denunciar reseña:', err);
        alert('Error al denunciar la reseña.');
      }
    });
  }
}
