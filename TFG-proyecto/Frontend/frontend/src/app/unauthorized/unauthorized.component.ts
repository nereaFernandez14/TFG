import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized">
      <h2>Acceso denegado</h2>
      <p>No tienes permiso para acceder a esta página.</p>
    </div>
  `,
  styles: [`
    .unauthorized {
      text-align: center;
      margin-top: 50px;
      color: #a94442;
      font-family: Arial, sans-serif;
    }
  `]
})
export class UnauthorizedComponent {}