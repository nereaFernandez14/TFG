import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImagenEventService {
  private imagenesActualizadas = new BehaviorSubject<boolean>(false);

  emitirActualizacion() {
    this.imagenesActualizadas.next(true);
  }

  obtenerActualizacion() {
    return this.imagenesActualizadas.asObservable();
  }
}
