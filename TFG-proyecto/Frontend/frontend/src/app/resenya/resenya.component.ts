import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-resenya',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resenya.component.html',
  styleUrls: ['./resenya.component.css']
})
export class ResenyaComponent {
  @Input() restauranteNombre: string = '';
  resenyaForm: FormGroup;
  estrellas: number[] = [1, 2, 3, 4, 5];
  puntuacionSeleccionada = 0;
  puntuacionHover = 0;
  mostrarExito = false;
  visible = true;

  constructor(private fb: FormBuilder) {
    this.resenyaForm = this.fb.group({
      comentario: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  seleccionarPuntuacion(valor: number) {
    this.puntuacionSeleccionada = valor;
  }

  destacarPuntuacion(valor: number) {
    this.puntuacionHover = valor;
  }

  resetearHover() {
    this.puntuacionHover = 0;
  }

  enviarResena() {
    if (!this.resenyaForm.valid || this.puntuacionSeleccionada === 0) return;

    // Aquí iría tu lógica de envío real
    console.log('Reseña enviada:', {
      puntuacion: this.puntuacionSeleccionada,
      comentario: this.resenyaForm.value.comentario
    });

    this.mostrarExito = true;

    // Simular cierre tras 2 segundos
    setTimeout(() => {
      this.visible = false;
    }, 2000);
  }

  cerrarSinGuardar() {
    this.visible = false;
  }
}
