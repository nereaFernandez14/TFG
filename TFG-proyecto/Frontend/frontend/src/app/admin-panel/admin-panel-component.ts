import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  modificacionesUsuario: any[] = [];
  notificaciones: any[] = [];

  seccionesAbiertas = {
    denuncias: true,
    restaurantes: false,
    usuarios: false,
    modificar: false,
    modificacionUsuario: false
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

  camposUsuario = [
    { label: 'Nombre', value: 'nombre' },
    { label: 'Apellidos', value: 'apellido' },
    { label: 'Email', value: 'email' }
  ];

  campoSeleccionado: { [key: number]: string } = {};
  nuevoValor: { [key: number]: any } = {};

  campoSeleccionadoUsuario: { [key: number]: string } = {};
  nuevoValorUsuario: { [key: number]: any } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDenuncias();
    this.cargarPeticionesBaja();
    this.cargarModificaciones();
    this.cargarModificacionesUsuarios();
    this.cargarNotificacionesAdmin();
  }

  eliminarItemPorId(lista: any[], id: number): any[] {
    return lista.filter(item => item.id !== id);
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

  cargarModificacionesUsuarios() {
    this.http.get<any[]>('/api/admin/modificaciones-usuarios').subscribe(data => {
      this.modificacionesUsuario = data;

      for (let solicitud of data) {
        const id = solicitud.usuario.id;
        this.campoSeleccionadoUsuario[id] = solicitud.campo;
        this.nuevoValorUsuario[id] = solicitud.nuevoValor;
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
      this.notificaciones = this.eliminarItemPorId(this.notificaciones, id);
    });
  }

  aceptarDenuncia(id: number) {
    this.http.post(`/api/admin/denuncias/${id}/aceptar`, {}).subscribe(() => {
      this.denuncias = this.eliminarItemPorId(this.denuncias, id);
    });
  }

  rechazarDenuncia(id: number) {
    this.http.post(`/api/admin/denuncias/${id}/rechazar`, {}).subscribe(() => {
      this.denuncias = this.eliminarItemPorId(this.denuncias, id);
    });
  }

  eliminarRestaurante(id: number) {
    this.http.delete(`/api/admin/restaurantes/${id}`).subscribe(() => {
      this.bajasRestaurantes = this.eliminarItemPorId(this.bajasRestaurantes, id);
    });
  }

  eliminarUsuario(id: number) {
    this.http.delete(`/api/admin/usuarios/${id}`).subscribe(() => {
      this.bajasUsuarios = this.eliminarItemPorId(this.bajasUsuarios, id);
    });
  }

  rechazarBajaUsuario(id: number) {
    this.http.post(`/api/admin/usuarios/${id}/rechazar-baja`, {}).subscribe(() => {
      alert('❌ Solicitud de baja rechazada');
      this.bajasUsuarios = this.eliminarItemPorId(this.bajasUsuarios, id);
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
        this.cargarModificaciones(); // ✅ recarga la lista desde backend
        this.campoSeleccionado[id] = '';
        this.nuevoValor[id] = '';
      },
      error: (err) => {
        console.error('❌ Error al actualizar restaurante', err);
        alert('⚠️ Error al actualizar el restaurante');
      }
    });
  }

  actualizarCampoUsuario(id: number) {
    const campo = this.campoSeleccionadoUsuario[id];
    const valor = this.nuevoValorUsuario[id];

    if (!campo || valor === undefined || valor === '') {
      alert('⚠️ Debes seleccionar un campo y escribir un valor válido.');
      return;
    }

    const payload = {
      campo: campo,
      nuevoValor: valor
    };

    this.http.put(`/api/admin/usuarios/${id}/modificar`, payload).subscribe({
      next: () => {
        alert('✅ Usuario actualizado correctamente');
        this.cargarModificacionesUsuarios(); // ✅ recarga la lista desde backend
        this.campoSeleccionadoUsuario[id] = '';
        this.nuevoValorUsuario[id] = '';
      },
      error: (err) => {
        console.error('❌ Error al actualizar usuario', err);
        alert('⚠️ Error al actualizar el usuario');
      }
    });
  }

  toggleSeccion(seccion: keyof typeof this.seccionesAbiertas) {
    this.seccionesAbiertas[seccion] = !this.seccionesAbiertas[seccion];
  }
}
