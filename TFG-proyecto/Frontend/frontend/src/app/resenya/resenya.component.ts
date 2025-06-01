import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-resenya',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resenya.component.html',
  styleUrls: ['./resenya.component.css']
})
export class ResenyaComponent {
  @Input() restauranteId!: number;
  @Input() restauranteNombre: string = '';
  @Output() resenaEnviada = new EventEmitter<void>();

  resenyaForm: FormGroup;
  estrellas: number[] = [1, 2, 3, 4, 5];
  puntuacionSeleccionada = 0;
  puntuacionHover = 0;
  mostrarExito = false;
  visible = true;

  imagenes: File[] = [];
  vistaPrevia: string[] = [];
  palabrasMalas = ['puta', 'mierda', 'gilipollas', 'estúpido'];
  comentarioValido = true;

  constructor(private fb: FormBuilder, private http: HttpClient) {
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
    const formData = new FormData();
    formData.append('restauranteId', this.restauranteId.toString());
    formData.append('contenido', this.resenyaForm.value.comentario);
    formData.append('valoracion', this.puntuacionSeleccionada.toString());

    this.http.post(`/api/resenyas`, formData, {
      withCredentials: true
    }).subscribe({
      next: () => {
        console.log('✅ Reseña enviada correctamente');
        this.mostrarExito = true;
        this.resenaEnviada.emit();
        setTimeout(() => {
          this.visible = false;
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error al enviar reseña:', err);
      }
    });
  }

  cerrarSinGuardar() {
    this.visible = false;
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.imagenes = Array.from(input.files);
    this.vistaPrevia = [];

    this.imagenes.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vistaPrevia.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  validarComentario() {
    const texto = this.resenyaForm.value.comentario.toLowerCase();
    this.comentarioValido = !this.palabrasMalas.some(palabra => texto.includes(palabra));
  }
}
