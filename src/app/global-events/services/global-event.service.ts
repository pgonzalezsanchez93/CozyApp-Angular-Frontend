import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { GlobalEvent } from '../interfaces/global-event.interface';
import { CreateGlobalEventDto, UpdateGlobalEventDto } from '../dto';
import { ErrorHandlerService } from '../../core/services/error-handler.service';


@Injectable({
  providedIn: 'root'
})
export class GlobalEventService {
   private readonly baseUrl: string = `${environment.baseUrl}/api/global-events`;
  private http = inject(HttpClient);

  constructor() { }

  getGlobalEvents(showInactive: boolean = false): Observable<GlobalEvent[]> {
    return this.http.get<GlobalEvent[]>(`${this.baseUrl}?showInactive=${showInactive}`)
      .pipe(
        catchError(err => {
          console.error('Error getting global events:', err);
          return of([]);
        })
      );
  }

  getActiveGlobalEvents(): Observable<GlobalEvent[]> {
    return this.http.get<GlobalEvent[]>(`${this.baseUrl}/active`)
      .pipe(
        catchError(err => {
          console.error('Error getting active global events:', err);
          return of([]);
        })
      );
  }

  getUpcomingGlobalEvents(days: number = 30): Observable<GlobalEvent[]> {
    return this.http.get<GlobalEvent[]>(`${this.baseUrl}/upcoming?days=${days}`)
      .pipe(
        catchError(err => {
          console.error('Error getting upcoming global events:', err);
          return of([]);
        })
      );
  }

  getGlobalEvent(id: string): Observable<GlobalEvent> {
    return this.http.get<GlobalEvent>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Error getting global event:', err);
          return throwError(() => err.error?.message || 'Error al obtener evento');
        })
      );
  }

  createGlobalEvent(createGlobalEventDto: CreateGlobalEventDto): Observable<GlobalEvent> {
    return this.http.post<GlobalEvent>(`${this.baseUrl}`, createGlobalEventDto)
      .pipe(
        tap(event => {
          console.log('Evento global creado:', event);
        }),
        catchError(err => {
          console.error('Error creating global event:', err);
          return throwError(() => err.error?.message || 'Error al crear evento global');
        })
      );
  }

  updateGlobalEvent(id: string, updateGlobalEventDto: UpdateGlobalEventDto): Observable<GlobalEvent> {
    return this.http.patch<GlobalEvent>(`${this.baseUrl}/${id}`, updateGlobalEventDto)
      .pipe(
        catchError(err => {
          console.error('Error updating global event:', err);
          return throwError(() => err.error?.message || 'Error al actualizar evento');
        })
      );
  }

  deleteGlobalEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Error deleting global event:', err);
          return throwError(() => err.error?.message || 'Error al eliminar evento');
        })
      );
  }
}
