import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from '../auth/services/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
    private readonly baseUrl: string = `${environment.baseUrl}/api/stats`;
  private http = inject(HttpClient);

  constructor() { }

  getTaskStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tasks`)
      .pipe(
        catchError(err => {
          console.error('Error getting task statistics:', err);
          return throwError(() => err.error?.message || 'Error al obtener estadísticas de tareas');
        })
      );
  }

  getRecentTasks(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/recent-tasks?limit=${limit}`)
      .pipe(
        catchError(err => {
          console.error('Error getting recent tasks:', err);
          return throwError(() => err.error?.message || 'Error al obtener tareas recientes');
        })
      );
  }

  getPomodoroStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pomodoro`)
      .pipe(
        catchError(err => {
          console.error('Error getting pomodoro statistics:', err);
          return throwError(() => err.error?.message || 'Error al obtener estadísticas de pomodoro');
        })
      );
  }

  getProductivityByDay(days: number = 7): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/productivity?days=${days}`)
      .pipe(
        catchError(err => {
          console.error('Error getting productivity data:', err);
          return throwError(() => err.error?.message || 'Error al obtener datos de productividad');
        })
      );
  }

  getMostProductiveHours(days: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/productive-hours?days=${days}`)
      .pipe(
        catchError(err => {
          console.error('Error getting productive hours:', err);
          return throwError(() => err.error?.message || 'Error al obtener horas productivas');
        })
      );
  }
}
