import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usuario: Usuario | null = null;
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('✅ ProfileComponent cargado');
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data) => {
        console.log('📦 Datos del perfil recibidos', data);
        this.usuario = data;
      },
      error: (err) => console.error('❌ Error al obtener perfil:', err)
    });
  }

  irACambiarPassword(): void {
    this.router.navigate(['/change-password']);
  }

  irACrearRestaurante(): void {
    this.router.navigate(['/restaurante/crear']);
  }

  logout(): void {
    this.usuarioService.logout().subscribe({
      next: () => {
        console.log('🔒 Sesión cerrada desde perfil');
        // 🔐 Limpieza opcional de storage (por seguridad)
        localStorage.removeItem('usuario');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('❌ Error al cerrar sesión desde perfil', err);
        this.router.navigate(['/login']); // Incluso si falla, navega
      }
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.nombreArchivo = this.archivoSeleccionado.name;
    }
  }

  subirArchivo(event: Event): void {
    event.preventDefault();
    if (!this.archivoSeleccionado || !this.usuario) return;

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('email', this.usuario.email); // o ID si lo tienes mejor

    this.usuarioService.subirMenu(formData).subscribe({
      next: (resp) => {
        console.log('📤 Archivo subido correctamente', resp);
        alert('Menú subido correctamente ✅');
      },
      error: (err) => {
        console.error('❌ Error al subir archivo', err);
        alert('Error al subir el menú ❌');
      }
    });
  }
  solicitarBaja(): void {
    if (!this.usuario) return;

    const rol = this.usuario.rol?.toLowerCase();
    const confirmar = confirm(`¿Seguro que deseas solicitar la baja de tu cuenta (${rol})? Será revisado por un administrador.`);
    if (!confirmar) return;

    this.usuarioService.solicitarBaja(this.usuario.id!).subscribe({
      next: () => {
        alert(`✅ Solicitud de baja como ${rol} enviada correctamente.`);
        this.usuario!.solicitaBaja = true;
      },
      error: (err) => {
        console.error('❌ Error al solicitar baja', err);
        alert('Ocurrió un error al enviar la solicitud ❌');
      }
    });
  }

}
