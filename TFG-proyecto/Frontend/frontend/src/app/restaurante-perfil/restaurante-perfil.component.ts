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
  mostrarFormularioResena: boolean = false;
  modalAbierto: boolean = false;
  imagenActual: number = 0;
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

      // Solo si hay menú, generamos URL segura
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
