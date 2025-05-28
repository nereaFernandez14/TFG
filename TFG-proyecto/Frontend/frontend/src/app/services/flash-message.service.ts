import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlashMessageService {
  private mensajeSubject = new BehaviorSubject<string | null>(null);
  mensaje$ = this.mensajeSubject.asObservable();

  setMensaje(mensaje: string) {
    this.mensajeSubject.next(mensaje);

    // Limpia automáticamente tras 5 segundos
    setTimeout(() => this.clearMensaje(), 5000);
  }

  clearMensaje() {
    this.mensajeSubject.next(null);
  }

  getMensaje(): string | null {
    return this.mensajeSubject.value;
  }
}
