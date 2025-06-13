import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatearRestriccion',
  standalone: true // ✅ Muy importante si usas Angular standalone
})
export class FormatearRestriccionPipe implements PipeTransform {
  transform(value: string): string {
    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitaliza cada palabra
  }
}
