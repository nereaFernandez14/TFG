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
    console.log("🧪 Restaurantes para baja:", data);
    this.http.get<any[]>('/api/admin/bajas-restaurantes').subscribe({
  next: data => {
    console.log("🍳 Restaurantes para baja:", data);
    this.bajasRestaurantes = data;
  },
  error: err => {
    console.error("❌ ERROR al cargar bajas restaurantes", err);
  }
});
  // Asegúrate que esto imprime algo
    this.bajasRestaurantes = Array.isArray(data) ? data : [];
  });
}

  cargarModificaciones() {
  this.http.get<any[]>('/api/admin/modificaciones').subscribe(data => {
    this.modificaciones = data;

    for (let solicitud of data) {
      const restauranteId = solicitud.restauranteId || (solicitud.restaurante && solicitud.restaurante.id);

      if (!restauranteId) {
        console.warn('⚠️ Solicitud sin restaurante válido:', solicitud);
        continue; // Saltamos si no hay restaurante válido
      }

      this.campoSeleccionado[restauranteId] = solicitud.campo;
      this.nuevoValor[restauranteId] = solicitud.nuevoValor;
    }
  });
}


  cargarModificacionesUsuarios() {
    this.http.get<any[]>('/api/admin/modificaciones-usuarios').subscribe(data => {
      this.modificacionesUsuario = data;

      for (let solicitud of data) {
        const id = solicitud.id;
        this.campoSeleccionadoUsuario[id] = solicitud.campo;
        this.nuevoValorUsuario[id] = solicitud.nuevoValor;
      }
    });
  }

  cargarNotificacionesAdmin() {
    this.http.get<any[]>('/api/notificaciones/admin').subscribe({
      next: (data) => this.notificaciones = data,
      error: () => console.warn('ℹ️ No hay notificaciones para el administrador')
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

  actualizarCampoRestaurante(solicitudId: number, restauranteId: number) {
    const campo = this.campoSeleccionado[restauranteId];
    const valor = this.nuevoValor[restauranteId];

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

    this.http.put(`/api/admin/restaurantes/${restauranteId}`, payload).subscribe({
      next: () => {
        this.http.post(`/api/admin/modificaciones/${solicitudId}/aceptar`, {}).subscribe({
          next: () => {
            alert('✅ Restaurante actualizado y solicitud aceptada');
            this.modificaciones = this.eliminarItemPorId(this.modificaciones, solicitudId);
            this.campoSeleccionado[restauranteId] = '';
            this.nuevoValor[restauranteId] = '';
          },
          error: err => {
            console.error('❌ Error al aceptar solicitud', err);
            alert('⚠️ Error al aceptar solicitud');
          }
        });
      },
      error: err => {
        console.error('❌ Error al actualizar restaurante', err);
        alert('⚠️ Error al actualizar el restaurante');
      }
    });
  }

  modificarUsuario(solicitudId: number, usuarioId: number, campo: string, nuevoValor: string) {
    if (!campo || !nuevoValor) {
      alert('⚠️ Campo o valor inválido');
      return;
    }

    const payload = {
      campo: campo,
      nuevoValor: nuevoValor
    };

    this.http.put(`/api/admin/usuarios/${usuarioId}/modificar`, payload).subscribe({
      next: () => {
        alert('✅ Usuario actualizado correctamente');
        this.modificacionesUsuario = this.eliminarItemPorId(this.modificacionesUsuario, solicitudId);
      },
      error: (err) => {
        console.error('❌ Error al actualizar usuario', err);
        alert('⚠️ Error al actualizar usuario');
      }
    });
  }

  toggleSeccion(seccion: keyof typeof this.seccionesAbiertas) {
    this.seccionesAbiertas[seccion] = !this.seccionesAbiertas[seccion];
  }
}
