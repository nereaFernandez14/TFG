import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resenya',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resenya.component.html',
  styleUrls: ['./resenya.component.css']
})
export class ResenyaComponent implements OnInit {
  @Input() restauranteId!: number;
  @Input() restauranteNombre: string = '';
  @Output() resenaEnviada = new EventEmitter<void>();

  resenyaForm: FormGroup;
  estrellas: number[] = [1, 2, 3, 4, 5];
  puntuacionSeleccionada = 0;
  puntuacionHover = 0;
  mostrarExito = false;
  mostrarError = false;
  mensajeError = '';
  imagenes: File[] = [];
  vistaPrevia: string[] = [];
  palabrasMalas = ['puta', 'mierda', 'gilipollas', 'estúpido'];
  comentarioValido = true;

  yaTieneResena = false;
  cargandoEstadoResena = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.resenyaForm = this.fb.group({
      comentario: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  ngOnInit() {
    this.http.get<{ yaExiste: boolean, puntuacion?: number }>(`/api/resenyas/usuario/${this.restauranteId}`, {
      withCredentials: true
    }).subscribe({
      next: (res) => {
        this.yaTieneResena = res.yaExiste;
        this.puntuacionSeleccionada = res.puntuacion ?? 0;
        this.cargandoEstadoResena = false;
      },
      error: (err) => {
        console.error('❌ Error verificando existencia de reseña:', err);
        this.cargandoEstadoResena = false;
      }
    });
  }

  seleccionarPuntuacion(valor: number) {
    if (this.yaTieneResena) return;
    this.puntuacionSeleccionada = valor;
  }

  destacarPuntuacion(valor: number) {
    if (this.yaTieneResena) return;
    this.puntuacionHover = valor;
  }

  resetearHover() {
    if (this.yaTieneResena) return;
    this.puntuacionHover = 0;
  }

  enviarResena() {
    this.validarComentario();
    this.resetearEstados();
    if (!this.comentarioValido) return;

    const formData = new FormData();
    formData.append('restauranteId', this.restauranteId.toString());
    formData.append('contenido', this.resenyaForm.value.comentario);
    formData.append('valoracion', this.puntuacionSeleccionada.toString());
    this.imagenes.forEach(file => formData.append('imagenes', file));

    this.http.post(`/api/resenyas`, formData, { withCredentials: true }).subscribe({
      next: () => {
        this.mostrarExito = true;
        this.resenaEnviada.emit();
        this.recargarPagina();
      },
      error: (err) => this.procesarError(err)
    });
  }

  actualizarResena() {
    this.validarComentario();
    this.resetearEstados();
    if (!this.comentarioValido) return;

    const formData = new FormData();
    formData.append('restauranteId', this.restauranteId.toString());
    formData.append('contenido', this.resenyaForm.value.comentario);
    formData.append('valoracion', this.puntuacionSeleccionada.toString());
    this.imagenes.forEach(file => formData.append('imagenes', file));

    this.http.put(`/api/resenyas`, formData, { withCredentials: true }).subscribe({
      next: () => {
        this.mostrarExito = true;
        this.resenaEnviada.emit();
        this.recargarPagina();
      },
      error: (err) => this.procesarError(err)
    });
  }

  procesarError(err: any) {
    this.mostrarError = true;
    if (err.status === 400 && err.error?.error) {
      this.mensajeError = `⚠️ ${err.error.error}`;
    } else if (err.status === 409) {
      this.mensajeError = '⚠️ Ya existe una reseña para este restaurante.';
    } else if (err.status === 401) {
      this.mensajeError = '⚠️ Necesitas estar autenticado para hacer una reseña.';
    } else {
      this.mensajeError = '❌ Ha ocurrido un error inesperado.';
    }
  }

  resetearEstados() {
    this.mostrarError = false;
    this.mostrarExito = false;
    this.mensajeError = '';
  }

  recargarPagina() {
    this.router.navigate([`/restaurantes/${this.restauranteId}`])
      .then(() => window.location.reload());
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.imagenes = Array.from(input.files);
    this.vistaPrevia = [];
    this.imagenes.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.vistaPrevia.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  validarComentario() {
    const texto = this.resenyaForm.value.comentario.toLowerCase();
    this.comentarioValido = !this.palabrasMalas.some(p => texto.includes(p));
  }
}
