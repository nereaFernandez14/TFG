import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  denuncias: any[] = [];
  bajasRestaurantes: any[] = [];
  bajasUsuarios: any[] = [];
  seccionesAbiertas = {
    denuncias: true,
    restaurantes: false,
    usuarios: false
  };
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDenuncias();
    this.cargarPeticionesBaja();
  }

  cargarDenuncias() {
    this.http.get<any[]>('/api/admin/denuncias').subscribe(data => {
      this.denuncias = data;
    });
  }

  cargarPeticionesBaja() {
    this.http.get<any[]>('/api/admin/bajas-restaurantes').subscribe(data => {
      this.bajasRestaurantes = data;
    });

    this.http.get<any[]>('/api/admin/bajas-usuarios').subscribe(data => {
      this.bajasUsuarios = data;
    });
  }

  aceptarDenuncia(id: number) {
    this.http.post(`/api/admin/denuncias/${id}/aceptar`, {},{ withCredentials: true }).subscribe(() => {
      this.denuncias = this.denuncias.filter(d => d.id !== id);
    });
  }

  rechazarDenuncia(id: number) {
    this.http.post(`/api/admin/denuncias/${id}/rechazar`, {}).subscribe(() => {
      this.denuncias = this.denuncias.filter(d => d.id !== id);
    });
  }

  eliminarRestaurante(id: number) {
    this.http.delete(`/api/admin/restaurantes/${id}`).subscribe(() => {
      this.bajasRestaurantes = this.bajasRestaurantes.filter(r => r.id !== id);
    });
  }

  eliminarUsuario(id: number) {
    this.http.delete(`/api/admin/usuarios/${id}`).subscribe(() => {
      this.bajasUsuarios = this.bajasUsuarios.filter(u => u.id !== id);
    });
  }
  rechazarBajaUsuario(id: number) {
    this.http.post(`/api/admin/usuarios/${id}/rechazar-baja`, {}, { withCredentials: true }).subscribe(() => {
      alert('❌ Solicitud de baja rechazada');
      this.bajasUsuarios = this.bajasUsuarios.filter(u => u.id !== id);
    });
  }
  
  toggleSeccion(seccion: 'denuncias' | 'restaurantes' | 'usuarios') {
    this.seccionesAbiertas[seccion] = !this.seccionesAbiertas[seccion];
  }


}
