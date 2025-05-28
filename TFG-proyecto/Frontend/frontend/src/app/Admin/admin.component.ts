import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin">
      <h2>Bienvenido, administrador</h2>
      <p>Área restringida a usuarios con rol ADMIN</p>
    </div>
  `,
  styles: [`
    .admin {
      text-align: center;
      margin-top: 50px;
    }
  `]
})
export class AdminComponent {}
