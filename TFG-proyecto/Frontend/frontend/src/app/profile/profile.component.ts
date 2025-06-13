import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usuario: any;
  restaurante: any;

  restriccionesEnum: string[] = [
    'VEGANO',
    'VEGETARIANO',
    'CELIACO',
    'SIN_LACTOSA',
    'DIABETICO',
    'SIN_GLUTEN',
    'HALAL',
    'KOSHER'
  ];

  restriccionesSeleccionadas: string[] = [];
  notificaciones: any[] = [];

  campoSeleccionadoUsuario: string = '';
  nuevoValorUsuario: string = '';
  mostrarVentanaModificacionUsuario = false;
  botonUsuarioDeshabilitado = false;

  nombreArchivo: string = '';
  archivoSeleccionado!: File;

  nombresImagenes: string[] = [];
  imagenesSeleccionadas: File[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.obtenerPerfil();
  }

  obtenerPerfil() {
    this.http.get<any>('/api/usuarios/perfil', { withCredentials: true }).subscribe({
      next: (data) => {
        this.usuario = data;
        this.restriccionesSeleccionadas = data.restriccionesDieteticas || [];
        this.notificaciones = data.notificaciones || [];

        if (data.rol === 'RESTAURANTE') {
          this.obtenerRestaurante();
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  obtenerRestaurante() {
    this.http.get<any>('/api/restaurantes/mis-datos', { withCredentials: true }).subscribe({
      next: (restaurante) => {
        this.restaurante = restaurante;
      }
    });
  }

  formatearRestriccion(restriccion: string): string {
    const map: any = {
      VEGANO: 'Vegano',
      VEGETARIANO: 'Vegetariano',
      CELIACO: 'Celíaco',
      SIN_LACTOSA: 'Sin lactosa',
      DIABETICO: 'Diabético',
      SIN_GLUTEN: 'Sin gluten',
      HALAL: 'Halal',
      KOSHER: 'Kosher'
    };
    return map[restriccion] || restriccion;
  }

  toggleRestriccion(restriccion: string) {
    if (this.restriccionesSeleccionadas.includes(restriccion)) {
      this.restriccionesSeleccionadas = this.restriccionesSeleccionadas.filter(r => r !== restriccion);
    } else {
      this.restriccionesSeleccionadas.push(restriccion);
    }
  }

  guardarPreferencias() {
    if (!this.usuario?.id) return;

    this.http.put(
      `/api/usuarios/${this.usuario.id}/preferencias-dieteticas`,
      this.restriccionesSeleccionadas,
      { withCredentials: true }
    ).subscribe({
      next: () => console.log('✅ Preferencias guardadas'),
      error: (err) => console.error('❌ Error al guardar preferencias:', err)
    });
  }

  cerrarNotificacion(id: number) {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.http.put(`/api/notificaciones/${id}/marcar-vista`, {}, { withCredentials: true }).subscribe();
  }

  irACambiarPassword() {
    this.router.navigate(['/cambiar-password']);
  }

  solicitarBaja() {
    this.http.post(
      `/api/${this.usuario.rol.toLowerCase()}s/${this.usuario.id}/solicitar-baja`,
      {},
      { withCredentials: true }
    ).subscribe();
  }

  abrirVentanaModificacionUsuario() {
    this.mostrarVentanaModificacionUsuario = true;
  }

  cerrarVentanaModificacionUsuario() {
    this.mostrarVentanaModificacionUsuario = false;
    this.campoSeleccionadoUsuario = '';
    this.nuevoValorUsuario = '';
  }

  enviarModificacionUsuario() {
    if (!this.usuario?.id || !this.campoSeleccionadoUsuario || !this.nuevoValorUsuario) return;

    this.botonUsuarioDeshabilitado = true;

    const payload = {
      campo: this.campoSeleccionadoUsuario,
      nuevoValor: this.nuevoValorUsuario
    };

    this.http.post(
      `/api/usuarios/${this.usuario.id}/solicitar-modificacion`,
      payload,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.cerrarVentanaModificacionUsuario();
        this.botonUsuarioDeshabilitado = false;
      },
      error: (err) => {
        console.error('❌ Error al enviar modificación:', err);
        this.botonUsuarioDeshabilitado = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
    }
  }

  subirArchivo(event: Event) {
    event.preventDefault();
    if (!this.archivoSeleccionado) return;

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);

    this.http.post(`/api/restaurantes/${this.usuario.id}/menu`, formData, { withCredentials: true }).subscribe(() => {
      this.nombreArchivo = '';
    });
  }

  onImagenesSeleccionadas(event: any) {
    this.imagenesSeleccionadas = Array.from(event.target.files);
    this.nombresImagenes = this.imagenesSeleccionadas.map(img => img.name);
  }

  subirImagenes(event: Event) {
    event.preventDefault();
    if (this.imagenesSeleccionadas.length === 0) return;

    const formData = new FormData();
    this.imagenesSeleccionadas.forEach(img => formData.append('imagenes', img));
    formData.append('email', this.usuario.email);

    this.http.post('/api/usuarios/subir-imagenes', formData, { withCredentials: true }).subscribe(() => {
      this.nombresImagenes = [];
      this.imagenesSeleccionadas = [];
    });
  }
}
