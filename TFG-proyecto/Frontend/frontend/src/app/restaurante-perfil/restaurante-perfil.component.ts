import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResenyaComponent } from '../resenya/resenya.component';
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from '../services/autenticacion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  mostrarFormularioResena = false;
  modalAbierto = false;
  yaTieneResena: boolean = false;
  imagenActual = 0;
  menuSanitizado: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AutenticacionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.restauranteId = +this.route.snapshot.paramMap.get('id')!;
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

  abrirModalResena() { this.modalAbierto = true; }
  cerrarModal() { this.modalAbierto = false; }
  obtenerNombreArchivo(ruta: string): string { return ruta.split(/[/\\]/).pop() || ''; }

  recargarResenas() {
    this.http.get<any[]>(`/api/restaurantes/${this.restauranteId}/resenas`).subscribe({
      next: data => {
        this.resenas = data;
      },
      error: err => {
        console.error("❌ Error al recargar reseñas", err);
      }
    });
  }


  esAutorDeResena(emailAutor: string): boolean {
  return this.authService.esAutorDeResena(emailAutor);
}


  borrarResena(id: number) {
    this.http.delete(`/api/resenyas/${id}`, { withCredentials: true }).subscribe(() => {
      this.recargarResenas();
    });
  }

  borrarImagenResena(imagenId: number) {
  this.http.delete(`/api/imagenes/${imagenId}`, { withCredentials: true }).subscribe({
    next: () => this.recargarResenas(),
    error: (err) => console.error('❌ Error al borrar imagen', err)
  });
}
borrarContenidoResena(resenaId: number) {
  this.http.patch(`/api/resenyas/${resenaId}/contenido`, { contenido: '' }, { withCredentials: true })
    .subscribe({
      next: () => this.recargarResenas(),
      error: (err) => console.error('❌ Error al borrar comentario', err)
    });
}

  anteriorImagen() {
    if (this.restaurante?.imagenes?.length) {
      this.imagenActual = (this.imagenActual - 1 + this.restaurante.imagenes.length) % this.restaurante.imagenes.length;
    }
  }
  siguienteImagen() {
    if (this.restaurante?.imagenes?.length) {
      this.imagenActual = (this.imagenActual + 1) % this.restaurante.imagenes.length;
    }
  }
}
