import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RestauranteDashboardService, RestauranteDashboardDatos } from '../services/restaurante-dashboard.service';
import { AutenticacionService } from '../services/autenticacion.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TipoCocina } from '../models/enums/tipo-cocina.enum';
import { Barrio } from '../models/enums/barrio.enum';
import { RangoPrecio } from '../models/enums/rango-precio.enum';
import { RestriccionDietetica } from '../models/enums/restriccion-dietetica.enum';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  datos!: RestauranteDashboardDatos;

  mostrarVentanaModificacion: boolean = false;
  campoSeleccionado: string = '';
  nuevoValor: string = '';
  nuevoValorMultiple: string[] = [];
  valorPersonalizado: string = '';
  botonDeshabilitado: boolean = false;

  notificaciones: { id: number, mensaje: string }[] = [];

  camposDisponibles = [
    { label: 'Nombre', value: 'nombre' },
    { label: 'Dirección', value: 'direccion' },
    { label: 'Teléfono', value: 'telefono' },
    { label: 'Email', value: 'email' },
    { label: 'Tipo de Cocina', value: 'tipoCocina' },
    { label: 'Barrio', value: 'barrio' },
    { label: 'Rango de Precio', value: 'rangoPrecio' },
    { label: 'Restricciones Dietéticas', value: 'restriccionesDieteticas' }
  ];

  tipoCocinaEnum = Object.values(TipoCocina);
  barrioEnum = Object.values(Barrio);
  rangoPrecioEnum = Object.values(RangoPrecio);
  restriccionesEnum = Object.values(RestriccionDietetica);

  constructor(
    private dashboardService: RestauranteDashboardService,
    private authService: AutenticacionService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const restaurante = this.authService.obtenerUsuario();
    if (restaurante?.id) {
      this.dashboardService.obtenerResumen(restaurante.id).subscribe({
        next: (data) => (this.datos = data),
        error: (err) => console.error('❌ Error cargando resumen dashboard', err)
      });

      this.http.get<{ id: number, mensaje: string }[]>(`/api/notificaciones?restauranteId=${restaurante.id}`)
        .subscribe({
          next: (mensajes) => this.notificaciones = mensajes,
          error: () => console.warn('ℹ️ No hay notificaciones nuevas')
        });
    }
  }

  marcarComoVista(id: number) {
    this.http.put(`/api/notificaciones/${id}/marcar-vista`, {})
      .subscribe(() => {
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
      });
  }

  pedirBajaRestaurante() {
    const confirmado = confirm('¿Estás seguro de que deseas solicitar la baja del restaurante?');
    if (!confirmado) return;

    const usuario = this.authService.obtenerUsuario();
    if (!usuario?.id) return;

    this.dashboardService.solicitarBaja(usuario.id).subscribe({
      next: () => alert('Solicitud de baja enviada al administrador ✅'),
      error: (err) => {
        console.error('❌ Error solicitando baja', err);
        alert('Ocurrió un error al solicitar la baja.');
      }
    });
  }

  abrirVentanaModificacion() {
    this.mostrarVentanaModificacion = true;
    this.botonDeshabilitado = false;
  }

  cerrarVentanaModificacion() {
    this.mostrarVentanaModificacion = false;
    this.campoSeleccionado = '';
    this.nuevoValor = '';
    this.valorPersonalizado = '';
    this.nuevoValorMultiple = [];
    this.botonDeshabilitado = false;
  }

  onCampoSeleccionadoChange() {
    if (this.campoSeleccionado !== 'tipoCocina') {
      this.valorPersonalizado = '';  // ✅ Limpiar campo personalizado si ya no es relevante
    }
    this.nuevoValor = '';
    this.nuevoValorMultiple = [];
  }

  onNuevoValorChange() {
    if (this.campoSeleccionado === 'tipoCocina' && this.nuevoValor !== 'OTRO') {
      this.valorPersonalizado = ''; // ✅ Limpiar también si elige algo diferente a OTRO
    }
  }

  enviarPeticionModificacion() {
    const usuario = this.authService.obtenerUsuario();
    const restauranteId = usuario?.id;

    if (!this.campoSeleccionado || !restauranteId) {
      alert('⚠️ Faltan datos para enviar la solicitud');
      return;
    }

    let campo = this.campoSeleccionado;
    let nuevoValor = '';

    if (campo === 'restriccionesDieteticas') {
      if (this.nuevoValorMultiple.length === 0) {
        alert('⚠️ Selecciona al menos una restricción dietética');
        return;
      }

      const valorActual = (this.datos.restricciones || []).join(',');
      const valorNuevo = this.nuevoValorMultiple.join(',');

      if (valorActual === valorNuevo) {
        alert('⚠️ Selecciona una combinación diferente de restricciones dietéticas');
        return;
      }

      nuevoValor = valorNuevo;

    } else if (campo === 'tipoCocina' && this.nuevoValor === 'OTRO') {
      if (!this.valorPersonalizado.trim()) {
        alert('⚠️ Especifica el tipo personalizado');
        return;
      }

      const actual = (this.datos as any)['tipoCocinaPersonalizado']?.trim() || '';
      if (actual.toLowerCase() === this.valorPersonalizado.trim().toLowerCase()) {
        alert('⚠️ El nuevo tipo personalizado debe ser diferente al actual');
        return;
      }

      campo = 'tipoCocinaPersonalizado';
      nuevoValor = this.valorPersonalizado.trim();

    } else {
      if (!this.nuevoValor.trim()) {
        alert('⚠️ Completa el nuevo valor');
        return;
      }

      const actual = (this.datos as any)[campo];
      if (actual?.toString().trim().toLowerCase() === this.nuevoValor.trim().toLowerCase()) {
        alert('⚠️ El nuevo valor debe ser diferente al actual');
        return;
      }

      nuevoValor = this.nuevoValor.trim();
    }

    this.botonDeshabilitado = true;

    this.http.post(`/api/restaurantes/${restauranteId}/solicitar-modificacion`, {
      campo,
      nuevoValor
    }).subscribe({
      next: () => {
        alert('✅ Petición enviada al administrador correctamente');
        this.cerrarVentanaModificacion();
      },
      error: (err) => {
        console.error('❌ Error enviando modificación', err);
        alert('Ocurrió un error al enviar la solicitud.');
        this.botonDeshabilitado = false;
      }
    });
  }
}
