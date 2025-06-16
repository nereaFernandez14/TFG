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
import { FormatearRangoPrecioPipe } from '../pipes/formatearRangoPrecio.pipe';
import { FormatearRestriccionPipe } from '../pipes/formatearRestriccion.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FormatearRangoPrecioPipe, FormatearRestriccionPipe],
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
  errorMensaje: string = '';

  notificaciones: { id: number, mensaje: string }[] = [];

  readonly backendUrl = 'https://localhost:8443';

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
  palabrasProhibidas = ['puta', 'mierda', 'gilipollas', 'imbécil', 'estú pido'];

  constructor(
    private dashboardService: RestauranteDashboardService,
    private authService: AutenticacionService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const restaurante = this.authService.obtenerUsuario();
    if (restaurante?.id) {
      this.dashboardService.obtenerResumen(restaurante.id).subscribe({
        next: (data) => {
          this.datos = data;
        },
        error: (err) => console.error('❌ Error cargando resumen dashboard', err)
      });

      this.http.get<{ id: number, mensaje: string }[]>(`/api/notificaciones?restauranteId=${restaurante.id}`)
        .subscribe({
          next: (mensajes) => this.notificaciones = mensajes,
          error: () => console.warn('ℹ️ No hay notificaciones nuevas')
        });
    }
  }

  obtenerUrlImagen(nombreArchivo: string): string {
    return `${this.backendUrl}/restaurantes/uploads/${this.datos.id}/${nombreArchivo}`;
  }

  formatearPalabra(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  capitalizarCadaPalabra(texto: string): string {
    return texto
      .split(' ')
      .map(p => this.formatearPalabra(p))
      .join(' ')
      .trim();
  }

  marcarComoVista(id: number): void {
    this.http.put(`/api/notificaciones/${id}/marcar-vista`, {}).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
      },
      error: (err) => {
        console.error('❌ Error al marcar notificación como vista', err);
      }
    });
  }

  pedirBajaRestaurante() {
    if (!this.datos?.id) {
      alert('❌ No se ha cargado el ID del restaurante');
      return;
    }

    const confirmado = confirm('¿Estás seguro de que deseas solicitar la baja del restaurante?');
    if (!confirmado) return;

    this.dashboardService.solicitarBaja(this.datos.id).subscribe({
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
    this.errorMensaje = '';
  }

  onCampoSeleccionadoChange() {
    if (this.campoSeleccionado !== 'tipoCocina') {
      this.valorPersonalizado = '';
    }
    this.nuevoValor = '';
    this.nuevoValorMultiple = [];
    this.errorMensaje = '';
  }

  onNuevoValorChange() {
    if (this.campoSeleccionado === 'tipoCocina' && this.nuevoValor !== 'OTRO') {
      this.valorPersonalizado = '';
    }
    this.errorMensaje = '';
  }

  validarEnTiempoReal(): void {
    const campo = this.campoSeleccionado;
    const valor = (campo === 'tipoCocinaPersonalizado' || (campo === 'tipoCocina' && this.nuevoValor === 'OTRO'))
      ? this.valorPersonalizado.trim()
      : this.nuevoValor.trim();

    const regexSinSignosNiCifras = /^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

    if (['tipoCocinaPersonalizado', 'nombre'].includes(campo) || (campo === 'tipoCocina' && this.nuevoValor === 'OTRO')) {
      if (!regexSinSignosNiCifras.test(valor)) {
        this.errorMensaje = '❌ No se aceptan cifras ni signos especiales.';
        return;
      }

      if (this.palabrasProhibidas.some(p => valor.toLowerCase().includes(p))) {
        this.errorMensaje = '❌ El nuevo valor contiene palabras no permitidas.';
        return;
      }
    }

    if (campo === 'direccion' && valor && !this.esDireccionValida(valor)) {
      this.errorMensaje = '❌ La dirección no tiene el formato correcto.';
      return;
    }

    if (campo === 'telefono' && valor && !this.esTelefonoValido(valor)) {
      this.errorMensaje = '❌ El teléfono no es válido.';
      return;
    }

    if (campo === 'email' && valor && !this.esEmailValido(valor)) {
      this.errorMensaje = '❌ El email no tiene un formato válido (.com, .es, .net, etc.).';
      return;
    }

    this.errorMensaje = '';
  }

  enviarPeticionModificacion() {
    this.validarEnTiempoReal();
    if (this.errorMensaje || !this.campoSeleccionado || !this.datos?.id) return;

    let campo = this.campoSeleccionado;
    let nuevoValor: string | string[];

    if (campo === 'rangoPrecio') {
      const match = Object.entries(RangoPrecio).find(([key, val]) => val === this.nuevoValor);
      if (!match) {
        alert('❌ Valor de rango de precio no válido');
        return;
      }
      nuevoValor = match[0];
    } else if (campo === 'restriccionesDieteticas') {
      if (this.nuevoValorMultiple.length === 0) return;

      const mapeados = this.nuevoValorMultiple.map(label => {
        const entry = Object.entries(RestriccionDietetica)
          .find(([clave, valorLegible]) => valorLegible === label);
        return entry ? entry[0] : null;
      });

      if (mapeados.includes(null)) {
        alert('❌ Algún valor de restricción dietética no es válido.');
        return;
      }

      nuevoValor = mapeados.join(',');
    } else if (campo === 'tipoCocina' && this.nuevoValor === 'OTRO') {
      if (!this.valorPersonalizado.trim()) return;
      const actual = (this.datos as any)['tipoCocinaPersonalizado']?.trim() || '';
      if (actual.toLowerCase() === this.valorPersonalizado.trim().toLowerCase()) {
        this.errorMensaje = '⚠️ El nuevo valor no puede ser igual al actual.';
        return;
      }
      campo = 'tipoCocinaPersonalizado';
      nuevoValor = this.valorPersonalizado.trim();
    } else {
      if (!this.nuevoValor || !this.nuevoValor.trim()) {
        this.errorMensaje = '⚠️ El campo no puede estar vacío.';
        return;
      }
      const actual = (this.datos as any)[campo];
      const normalizado = this.capitalizarCadaPalabra(this.nuevoValor);
      if (actual?.toString().trim().toLowerCase() === normalizado.trim().toLowerCase()) {
        this.errorMensaje = '⚠️ El nuevo valor no puede ser igual al actual.';
        return;
      }
      nuevoValor = normalizado;
    }

    this.botonDeshabilitado = true;

    this.http.post(`/api/restaurantes/${this.datos.id}/solicitar-modificacion`, {
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

  esDireccionValida(direccion: string): boolean {
    const regex = /^[\wÁÉÍÓÚáéíóúÑñ\s\.\-ºª]+ \d+[\w\s,ºª\.]*, [\wÁÉÍÓÚáéíóúÑñ\s]+, \d{5}$/;
    return regex.test(direccion.trim());
  }

  esTelefonoValido(telefono: string): boolean {
    const regexMovil = /^[6789]\d{8}$/;
    const regexFijo = /^0?[89]\d{7}$/;
    return regexMovil.test(telefono) || regexFijo.test(telefono);
  }

  esEmailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.(com|es|net|org|edu)$/i;
    return regex.test(email.trim().toLowerCase());
  }
}
