// IMPORTS IGUAL
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResenyaComponent } from '../resenya/resenya.component';
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from '../services/autenticacion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FavoritosService } from '../services/favoritos.service';

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
  resenaDelUsuario: any = null;
  esFavorito = false;
  esUsuario = false;
  usuarioId!: number;
  mensajeFavorito: string | null = null;

  readonly backendUrl = 'https://localhost:8443';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AutenticacionService,
    private sanitizer: DomSanitizer,
    private favoritosService: FavoritosService
  ) {}

  ngOnInit(): void {
    this.restauranteId = +this.route.snapshot.paramMap.get('id')!;
    this.http.get(`/api/restaurantes/${this.restauranteId}`).subscribe(data => {
      this.restaurante = data;
      if (this.restaurante?.rutaMenu) {
        const archivo = this.obtenerNombreArchivo(this.restaurante.rutaMenu);
        const url = `${this.backendUrl}/restaurantes/menus/${archivo}`;
        this.menuSanitizado = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }

      this.cargarImagenes(); // <- AÑADIDO
    });

    this.recargarResenas();
    this.mostrarFormularioResena = this.authService.isAuthenticated();
    const usuario = this.authService.usuarioActual();
    if (usuario?.rol === 'USUARIO') {
      this.usuarioId = usuario.id;
      this.esUsuario = true;

      this.favoritosService.obtenerFavoritos(this.usuarioId).subscribe(favs => {
        this.esFavorito = favs.some(f => f.id === this.restauranteId);
      });
    }
  }

 cargarImagenes() {
  this.http.get<any[]>(`${this.backendUrl}/restaurantes/${this.restauranteId}/imagenes`)
    .subscribe({
      next: (imagenes) => {
        this.restaurante.imagenes = imagenes.map(img => ({
          id: img.id,  // 👈 NECESARIO
          nombreArchivo: img.nombreArchivo,
          tipoArchivo: img.tipoArchivo
        }));
        this.imagenActual = 0;
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes del restaurante', err);
      }
    });
}



  abrirModalResena() { this.modalAbierto = true; }
  cerrarModal() { this.modalAbierto = false; }
  obtenerNombreArchivo(ruta: string): string { return ruta.split(/[/\\]/).pop() || ''; }

  recargarResenas() {
    this.http.get<any[]>(`/api/restaurantes/${this.restauranteId}/resenas`).subscribe({
      next: data => {
        this.resenas = data;
        const email = this.authService.getEmailUsuario();
        this.resenaDelUsuario = data.find(r => r.autorEmail === email) || null;
        this.yaTieneResena = !!this.resenaDelUsuario;
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

  mostrarMensaje(mensaje: string) {
    this.mensajeFavorito = mensaje;
    setTimeout(() => this.mensajeFavorito = null, 3000);
  }

  toggleFavorito() {
    if (this.esFavorito) {
      this.favoritosService.eliminarFavorito(this.usuarioId, this.restauranteId).subscribe(() => {
        this.esFavorito = false;
        this.mostrarMensaje('Restaurante eliminado de favoritos');
      });
    } else {
      this.favoritosService.agregarFavorito(this.usuarioId, this.restauranteId).subscribe(() => {
        this.esFavorito = true;
        this.mostrarMensaje('Restaurante añadido a favoritos');
      });
    }
  }
}
