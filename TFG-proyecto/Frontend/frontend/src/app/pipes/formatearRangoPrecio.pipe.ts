import { Pipe, PipeTransform } from '@angular/core';
import { RangoPrecio } from '../models/enums/rango-precio.enum';

@Pipe({
  name: 'formatearRangoPrecio',
  standalone: true
})
export class FormatearRangoPrecioPipe implements PipeTransform {
  transform(valor: RangoPrecio): string {
    switch (valor) {
      case RangoPrecio.BARATO:
        return '10-20€';
      case RangoPrecio.MEDIO:
        return '20-35€';
      case RangoPrecio.CARO:
        return '35-50€';
      default:
        return valor;
    }
  }
}
