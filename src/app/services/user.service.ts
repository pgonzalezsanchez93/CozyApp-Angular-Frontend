
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, firstValueFrom, throwError } from 'rxjs';
import { environment } from '../../environments/environments';
import { User, UserPreferences } from '../auth/interfaces';
import { CreateUserDto, UpdateProfileDto } from '../auth/dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl: string = `${environment.baseUrl}/api/auth`;
  private http = inject(HttpClient);

  constructor() { }

  updateProfile(updateProfileDto: UpdateProfileDto): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/profile`, updateProfileDto)
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al actualizar perfil'))
      );
  }

  updatePreferences(userId: string, preferences: UserPreferences): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/preferences`, preferences)
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al actualizar preferencias'))
      );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`)
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al obtener usuarios'))
      );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`)
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al obtener usuario'))
      );
  }

  createUser(createUserDto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, createUserDto)
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al crear usuario'))
      );
  }

  toggleUserStatus(id: string): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/status`, {})
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al cambiar estado del usuario'))
      );
  }

  updateUserRole(id: string, isAdmin: boolean): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/role`, { isAdmin })
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al actualizar rol'))
      );
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/users/${id}`)
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al eliminar usuario'))
      );
  }

  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats/users`)
      .pipe(
        catchError(err => throwError(() => err.error?.message || 'Error al obtener estadísticas'))
      );
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return await firstValueFrom(
      this.http.post<{ message: string }>(`${this.baseUrl}/password/request-reset`, { email })
        .pipe(
          catchError(err => throwError(() => err.error?.message || 'Error al solicitar reset'))
        )
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return await firstValueFrom(
    this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, { 
      token, 
      password: newPassword 
    }).pipe(
      catchError(err => throwError(() => err.error?.message || 'Error al resetear contraseña'))
    )
  );
}

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/password/change`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(err => throwError(() => err.error?.message || 'Error al cambiar contraseña'))
    );
  }
}
