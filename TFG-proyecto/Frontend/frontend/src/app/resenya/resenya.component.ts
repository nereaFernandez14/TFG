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
  @Input() resenaExistente: any;

  resenyaForm: FormGroup;
  estrellas: number[] = [1, 2, 3, 4, 5];
  puntuacionSeleccionada = 0;
  puntuacionHover = 0;
  mostrarExito = false;
  mostrarError = false;
  mensajeError = '';
  imagenes: File[] = [];
  vistaPrevia: { tipo: 'imagen' | 'video', src: string }[] = [];
  palabrasMalas = ['puta', 'mierda', 'gilipollas', 'estúpido'];
  comentarioValido = true;

  yaTieneResena = false;
  cargandoEstadoResena = true;

  indiceInicio = 0;
  cantidadVisible = 3;

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
    if (this.resenaExistente) {
      this.yaTieneResena = true;
      this.puntuacionSeleccionada = this.resenaExistente.valoracion ?? 0;
      this.resenyaForm.patchValue({ comentario: this.resenaExistente.contenido || '' });
      this.cargandoEstadoResena = false;
    } else {
      this.http.get<{ yaExiste: boolean, puntuacion?: number, contenido?: string }>(
        `/api/resenyas/usuario/${this.restauranteId}`,
        { withCredentials: true }
      ).subscribe({
        next: (res) => {
          this.yaTieneResena = res.yaExiste;
          this.puntuacionSeleccionada = res.puntuacion ?? 0;
          this.resenyaForm.patchValue({ comentario: res.contenido || '' });
          this.cargandoEstadoResena = false;
        },
        error: (err) => {
          console.error('❌ Error verificando existencia de reseña:', err);
          this.cargandoEstadoResena = false;
        }
      });
    }
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

    this.http.post(`/api/resenyas/actualizar`, formData, { withCredentials: true }).subscribe({
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

  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'video/mp4', 'video/webm', 'video/ogg'];
  const errores: string[] = [];

  Array.from(input.files).forEach(file => {
    const yaExiste = this.imagenes.some(existing =>
      existing.name === file.name &&
      existing.size === file.size &&
      existing.lastModified === file.lastModified
    );

    if (yaExiste) {
      errores.push(`⚠️ El archivo "${file.name}" ya fue añadido anteriormente.`);
      return; // ❗️Evita duplicación
    }

    if (tiposPermitidos.includes(file.type)) {
      this.imagenes.push(file);
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const tipo = file.type.startsWith('image/') ? 'imagen' : 'video';
        this.vistaPrevia.push({ tipo, src: e.target.result });
      };
      reader.readAsDataURL(file);
    } else {
      errores.push(`❌ "${file.name}" no es un archivo válido.`);
    }
  });

  if (errores.length > 0) {
    this.mostrarError = true;
    this.mensajeError = errores.join('<br/>');
  }
}

  validarComentario() {
    const texto = this.resenyaForm.value.comentario.toLowerCase();
    this.comentarioValido = !this.palabrasMalas.some(p => texto.includes(p));
  }

  avanzarCarrusel() {
    if (this.vistaPrevia.length === 0) return;
    this.indiceInicio = (this.indiceInicio + 1) % this.vistaPrevia.length;
  }

  retrocederCarrusel() {
    if (this.vistaPrevia.length === 0) return;
    this.indiceInicio = (this.indiceInicio - 1 + this.vistaPrevia.length) % this.vistaPrevia.length;
  }

  eliminarImagen(indexRelativo: number) {
    const realIndex = this.indiceInicio + indexRelativo;
    this.vistaPrevia.splice(realIndex, 1);
    this.imagenes.splice(realIndex, 1);

    if (this.indiceInicio >= this.vistaPrevia.length && this.indiceInicio > 0) {
      this.indiceInicio--;
    }
  }

  get imagenesVisibles() {
    return this.vistaPrevia.slice(this.indiceInicio, this.indiceInicio + this.cantidadVisible);
  }

}
