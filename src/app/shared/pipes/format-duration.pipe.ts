import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDuration'
})
export class FormatDurationPipe implements PipeTransform {
  transform(minutes: number, format: 'short' | 'long' = 'long'): string {
    if (minutes === undefined || minutes === null) {
      return '';
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (format === 'short') {
      return hours > 0
        ? `${hours}h ${mins}m`
        : `${mins}m`;
    } else {
      return hours > 0
        ? `${hours} ${hours === 1 ? 'hora' : 'horas'} ${mins > 0 ? `y ${mins} ${mins === 1 ? 'minuto' : 'minutos'}` : ''}`
        : `${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
    }
  }
}
