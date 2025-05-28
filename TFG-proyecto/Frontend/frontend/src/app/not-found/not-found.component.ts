import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="not-found">
      <h1>Error 404</h1>
      <p>La página que buscas no existe 😢</p>
      <a routerLink="/home">Volver al inicio</a>
    </div>
  `,
  styles: [`
    .not-found {
      text-align: center;
      margin-top: 80px;
      font-family: Arial, sans-serif;
    }

    .not-found a {
      color: #1976d2;
      text-decoration: none;
      font-weight: bold;
    }
  `]
})
export class NotFoundComponent {}