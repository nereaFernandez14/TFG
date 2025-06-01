import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResenyaComponent } from '../resenya/resenya.component';
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from '../services/autenticacion.service';

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


  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AutenticacionService
  ) {}

  ngOnInit(): void {
  this.restauranteId = +this.route.snapshot.paramMap.get('id')!;

  // Cargar restaurante
  this.http.get(`/api/restaurantes/${this.restauranteId}`).subscribe(data => {
    this.restaurante = data;
  });

  // Cargar reseñas
  this.http.get<any[]>(`/api/restaurantes/${this.restauranteId}/resenas`).subscribe(data => {
    this.resenas = data;
  });

  // ✅ Verificar si el usuario está autenticado
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
    });
}


}
