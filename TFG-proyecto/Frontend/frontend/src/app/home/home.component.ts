import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { RestauranteService } from '../services/restaurante.service';
import { Restaurante } from '../models/restaurante.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlashMessageService } from '../services/flash-message.service';
import { RolNombre } from '../models/enums/RolNombre.enum'; // ✅ Enum importado

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  usuarioEmail: string = '';
  searchQuery: string = '';
  restaurantes: Restaurante[] = [];
  mensajeLogout: string | null = null;

  destacados = [
    {
      nombre: 'Pizzería Bella',
      descripcion: 'Auténtica pizza napolitana en el centro'
    },
    {
      nombre: 'Sushi Tokyo',
      descripcion: 'Experiencia japonesa premium'
    }
  ];

  constructor(
    private autenticacionService: AutenticacionService,
    private router: Router,
    private restauranteService: RestauranteService,
    private flashService: FlashMessageService
  ) {}

  ngOnInit(): void {
    this.flashService.mensaje$.subscribe((mensaje) => {
      if (mensaje) {
        this.mensajeLogout = mensaje;
        console.log('📩 Mensaje recibido en home.component:', mensaje);

        setTimeout(() => {
          this.mensajeLogout = null;
        }, 5000);
      }
    });

    const usuario = this.autenticacionService.obtenerUsuario();
    console.log('Usuario autenticado:', usuario);

    if (!usuario) {
      console.log('🟢 Visitante navegando en home, sin autenticación.');
      return;
    }

    switch (usuario.rol) {
      case RolNombre.RESTAURANTE:
        this.router.navigate(['/restaurante']);
        break;
      case RolNombre.USUARIO:
        this.usuarioEmail = usuario.email || 'Desconocido';
        break;
      default:
        console.warn(`⚠️ Rol inesperado: ${usuario.rol}. Se queda en /home como visitante.`);
    }
  }

  logout() {
    this.autenticacionService.logout();
    this.router.navigate(['/login']);
  }

  buscar() {
    console.log('Buscando:', this.searchQuery);
    this.restauranteService.buscarRestaurantes(this.searchQuery).subscribe(
      (data) => {
        this.restaurantes = data;
        console.log('Resultados:', this.restaurantes);
      },
      (error) => {
        console.error('Error al buscar restaurantes', error);
      }
    );
  }
}
