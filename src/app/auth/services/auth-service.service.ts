import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap, map, catchError, throwError, timeout, BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthStatus, CheckTokenResponse, LoginResponse, TaskStats, User, UserPreferences } from '../interfaces';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl: string = environment.baseUrl;
  private http = inject(HttpClient);

  private _currentUser = signal<User|null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  private _currentUserSubject = new BehaviorSubject<User | null>(null);

  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());
  public currentUser$ = this._currentUserSubject.asObservable();


  constructor() {
    console.log('AuthService initialized, checking auth status...');
    this.checkAuthStatus().subscribe({
      next: (result) => {
        console.log('Initial auth check completed:', result);
      },
      error: (error) => {
        console.error('Initial auth check failed:', error);
        this._authStatus.set(AuthStatus.notAuthenticated);
      }
    });
  }

  private setAuthentication(user: User, token: string): boolean {
    console.log('Setting authentication for user:', user.email);
    console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    if (!token) {
      console.error('ERROR: No token provided');
      return false;
    }

    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem('token', token);

    const savedToken = localStorage.getItem('token');
    console.log('Token saved successfully:', !!savedToken);

    return true;
  }

  login(email: string, password: string): Observable<boolean> {
    console.log('Attempting login for:', email);
    this._authStatus.set(AuthStatus.checking);

    const url = `${this.baseUrl}/api/auth/login`;
    const body = { email, password };

    return this.http.post<LoginResponse>(url, body)
      .pipe(
        tap(response => {
          console.log('Login response received:', response);
        }),
        map(({ user, token }) => {
          console.log('Login successful, setting authentication');
          return this.setAuthentication(user, token);
        }),
        catchError(err => {
          console.error('Login failed:', err);
          this._authStatus.set(AuthStatus.notAuthenticated);
          const errorMessage = typeof err.error?.message === 'string'
            ? err.error.message
            : 'Error al iniciar sesión';
          return throwError(() => errorMessage);
        })
      );
  }

  register(registerData: { name: string, email: string, password: string }): Observable<boolean> {
    const url = `${this.baseUrl}/api/auth/register`;
    const body = registerData;

    return this.http.post<LoginResponse>(url, body)
      .pipe(
        map(({ user, token }) => this.setAuthentication(user, token)),
        catchError(err => {
          this._authStatus.set(AuthStatus.notAuthenticated);
          const errorMessage = typeof err.error?.message === 'string'
            ? err.error.message
            : 'Error al registrarse';
          return throwError(() => errorMessage);
        })
      );
  }

  checkAuthStatus(): Observable<boolean> {
    console.log('Checking auth status...');

    const url = `${this.baseUrl}/api/auth/check-token`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No token found, setting as not authenticated');
      this._authStatus.set(AuthStatus.notAuthenticated);
      return of(false);
    }

    console.log('Token found, verifying with server...');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<CheckTokenResponse>(url, { headers })
      .pipe(
        tap(response => {
          console.log('Token verification response:', response);
        }),
        map(({ user, token }) => {
          console.log('Token valid, setting authentication');
          return this.setAuthentication(user, token);
        }),
        catchError((error) => {
          console.log('Token verification failed:', error);
          this._authStatus.set(AuthStatus.notAuthenticated);
          localStorage.removeItem('token');
          return of(false);
        })
      );
  }

  logout() {
    console.log('Logging out user');
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.roles.includes('admin') || false;
  }
  updateCurrentUser(user: User): void {
    this._currentUser.set(user);
  }

   updateUserStats(taskStats: TaskStats): Observable<User> {
    const currentUser = this.currentUser();
    if (!currentUser) {
      throw new Error('No hay usuario logueado');
    }

    return this.http.put<User>(`${this.baseUrl}/users/${currentUser._id}/stats`, { taskStats })
      .pipe(
        tap(updatedUser => {

          this._currentUser.set(updatedUser);
        }),
        catchError(err => {
          console.error('Error updating user stats:', err);
          return throwError(() => err.error?.message || 'Error al actualizar estadísticas');
        })
      );
  }

  updateProfile(name: string, currentPassword?: string, newPassword?: string): Observable<User> {
    const url = `${this.baseUrl}/api/auth/profile`;
    const body: any = { name };

    if (currentPassword && newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    return this.http.put<User>(url, body)
      .pipe(
        tap(user => this._currentUser.set(user)),
        catchError(err => {
          const errorMessage = typeof err.error?.message === 'string'
            ? err.error.message
            : 'Error al actualizar perfil';
          return throwError(() => errorMessage);
        })
      );
  }

  updatePreferences(preferences: UserPreferences): Observable<User> {
    const url = `${this.baseUrl}/api/auth/preferences`;

    return this.http.put<User>(url, preferences)
      .pipe(
        tap(user => this._currentUser.set(user)),
        catchError(err => {
          const errorMessage = typeof err.error?.message === 'string'
            ? err.error.message
            : 'Error al actualizar preferencias';
          return throwError(() => errorMessage);
        })
      );
  }


  requestPasswordReset(email: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.baseUrl}/api/auth/password/request-reset`, { email })
    .pipe(
      catchError(err => {
        const errorMessage = typeof err.error?.message === 'string'
          ? err.error.message
          : 'Error al enviar solicitud de restablecimiento';
        return throwError(() => errorMessage);
      })
    );
}

resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.baseUrl}/api/auth/reset-password`, { 
    token, 
    password: newPassword 
  }).pipe(
    catchError(err => {
      const errorMessage = typeof err.error?.message === 'string'
        ? err.error.message
        : 'Error al restablecer la contraseña';
      return throwError(() => errorMessage);
    })
  );
}


  changePassword(passwordData: { currentPassword: string, newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/api/auth/password/change`, passwordData);
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/api/auth/delete-account`);
  }
}
