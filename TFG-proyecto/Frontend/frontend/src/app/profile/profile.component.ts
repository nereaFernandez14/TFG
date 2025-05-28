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

  constructor(private usuarioService: UsuarioService,private router: Router) {}

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
  irACambiarPassword() {
    console.log('Click');
    this.router.navigate(['/change-password']);
  }
}
