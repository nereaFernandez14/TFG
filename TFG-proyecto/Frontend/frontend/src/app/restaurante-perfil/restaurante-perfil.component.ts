import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResenyaComponent } from '../resenya/resenya.component';
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from '../services/autenticacion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RolNombre } from '../models/enums/RolNombre.enum';

@Component({
  selector: 'app-perfil-restaurante',
  standalone: true,
  imports: [CommonModule, ResenyaComponent],
  templateUrl: './restaurante-perfil.component.html',
  styleUrls: ['./restaurante-perfil.component.css']
})
export class RestaurantePerfilComponent implements OnInit {
  restauranteId!: number;
  restaurante: any;
  resenas: any[] = [];
  mostrarFormularioResena: boolean = false;
  modalAbierto: boolean = false;
  menuSanitizado: SafeResourceUrl | null = null;

  rol: RolNombre | null = null;
  RolNombre = RolNombre; // Exponemos enum para el HTML

  mostrarModalDenuncia: boolean = false;
  resenaSeleccionada: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AutenticacionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.restauranteId = +this.route.snapshot.paramMap.get('id')!;
    this.rol = this.authService.obtenerRol();

    this.http.get(`/api/restaurantes/${this.restauranteId}`).subscribe(data => {
      this.restaurante = data;

      if (this.restaurante?.rutaMenu) {
        const archivo = this.obtenerNombreArchivo(this.restaurante.rutaMenu);
        const url = `https://localhost:8443/restaurantes/menus/${archivo}`;
        this.menuSanitizado = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    });

    this.recargarResenas();
    this.mostrarFormularioResena = this.authService.isAuthenticated();
  }

  abrirModalResena() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  recargarResenas() {
    this.http.get<any[]>(`/api/restaurantes/${this.restauranteId}/resenas`).subscribe(data => {
      this.resenas = data;
      console.log('🖼️ Reseñas recibidas con imágenes:', this.resenas);
    });
  }

  obtenerNombreArchivo(ruta: string): string {
    return ruta.split(/[/\\]/).pop() || '';
  }

  abrirModalDenuncia(resena: any) {
    this.resenaSeleccionada = resena;
    this.mostrarModalDenuncia = true;
  }

  cerrarModalDenuncia() {
    this.mostrarModalDenuncia = false;
    this.resenaSeleccionada = null;
  }

  enviarDenuncia() {
    const payload = {
      idResenya: this.resenaSeleccionada.id,
      contenido: this.resenaSeleccionada.contenido,
      restauranteId: this.restaurante.id,
      restauranteNombre: this.restaurante.nombre
    };

    this.http.post('/api/denuncias', payload).subscribe(() => {
      alert('🚩 Denuncia enviada al administrador');
      this.cerrarModalDenuncia();
    });
  }

  eliminarResena(id: number) {
    if (confirm('¿Estás seguro de eliminar esta reseña?')) {
      this.http.delete(`/admin/resenya/${id}`).subscribe(() => {
        this.recargarResenas();
      });
    }
  }

  eliminarRestaurante() {
    if (confirm('¿Eliminar restaurante? Esta acción es irreversible')) {
      this.http.delete(`/admin/restaurante/${this.restauranteId}`).subscribe(() => {
        alert('Restaurante eliminado');
        // Redirigir si hace falta
      });
    }
  }
}
