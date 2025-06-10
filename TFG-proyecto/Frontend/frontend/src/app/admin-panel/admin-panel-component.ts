import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TipoCocina } from '../models/enums/tipo-cocina.enum';
import { Barrio } from '../models/enums/barrio.enum';
import { RangoPrecio } from '../models/enums/rango-precio.enum';
import { RestriccionDietetica } from '../models/enums/restriccion-dietetica.enum';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  denuncias: any[] = [];
  bajasRestaurantes: any[] = [];
  bajasUsuarios: any[] = [];
  modificaciones: any[] = [];
  notificaciones: any[] = [];

  seccionesAbiertas = {
    denuncias: true,
    restaurantes: false,
    usuarios: false,
    modificar: false
  };

  camposEditables = [
    { label: 'Nombre', value: 'nombre' },
    { label: 'Dirección', value: 'direccion' },
    { label: 'Teléfono', value: 'telefono' },
    { label: 'Email', value: 'email' },
    { label: 'Tipo de cocina', value: 'tipoCocina' },
    { label: 'Tipo cocina personalizado', value: 'tipoCocinaPersonalizado' },
    { label: 'Barrio', value: 'barrio' },
    { label: 'Rango de precio', value: 'rangoPrecio' },
    { label: 'Restricciones dietéticas', value: 'restriccionesDieteticas' }
  ];
  campoSeleccionado: { [key: number]: string } = {};
  nuevoValor: { [key: number]: any } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDenuncias();
    this.cargarPeticionesBaja();
    this.cargarModificaciones();
    this.cargarNotificacionesAdmin();
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

  cargarModificaciones() {
    this.http.get<any[]>('/api/admin/modificaciones').subscribe(data => {
      this.modificaciones = data;

      for (let solicitud of data) {
        const id = solicitud.restaurante.id;
        this.campoSeleccionado[id] = solicitud.campo;
        this.nuevoValor[id] = solicitud.nuevoValor;
      }
    });
  }

  cargarNotificacionesAdmin() {
    this.http.get<any[]>('/api/notificaciones/admin').subscribe({
      next: (data) => this.notificaciones = data,
      error: () => console.warn("ℹ️ No hay notificaciones para el administrador")
    });
  }

  marcarComoVista(id: number) {
    this.http.put(`/api/notificaciones/${id}/marcar-vista`, {}).subscribe(() => {
      this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    });
  }

  aceptarDenuncia(id: number) {
    this.http.post(`/api/admin/denuncias/${id}/aceptar`, {}).subscribe(() => {
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
    this.http.post(`/api/admin/usuarios/${id}/rechazar-baja`, {}).subscribe(() => {
      alert('❌ Solicitud de baja rechazada');
      this.bajasUsuarios = this.bajasUsuarios.filter(u => u.id !== id);
    });
  }

 actualizarCampoRestaurante(id: number) {
  const campo = this.campoSeleccionado[id];
  const valor = this.nuevoValor[id];

  if (!campo || valor === undefined || valor === '') {
    alert('⚠️ Debes seleccionar un campo y escribir un valor válido.');
    return;
  }

  const payload: any = {};

  if (campo === 'tipoCocinaPersonalizado') {
    payload['tipoCocina'] = 'OTRO';
    payload['tipoCocinaPersonalizado'] = valor;
  } else {
    payload[campo] = valor;
  }

  this.http.put(`/api/admin/restaurantes/${id}`, payload).subscribe({
    next: () => {
      alert('✅ Restaurante actualizado correctamente');
      this.modificaciones = this.modificaciones.filter(m => m.restaurante.id !== id);
      this.campoSeleccionado[id] = '';
      this.nuevoValor[id] = '';
    },
    error: (err) => {
      console.error('❌ Error al actualizar restaurante', err);
      alert('⚠️ Error al actualizar el restaurante');
    }
  });
}

  toggleSeccion(seccion: 'denuncias' | 'restaurantes' | 'usuarios' | 'modificar') {
    this.seccionesAbiertas[seccion] = !this.seccionesAbiertas[seccion];
  }
}
