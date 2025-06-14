import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritosService } from '../services/favoritos.service';
import { Restaurante } from '../models/restaurante.model';
import { AutenticacionService } from '../services/autenticacion.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {
  favoritos: Restaurante[] = [];

  constructor(
    private favoritosService: FavoritosService,
    private authService: AutenticacionService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.usuarioActual();
    if (usuario) {
      this.favoritosService.obtenerFavoritos(usuario.id).subscribe({
        next: data => this.favoritos = data,
        error: err => console.error('❌ Error al obtener favoritos', err)
      });
    }
  }
}
