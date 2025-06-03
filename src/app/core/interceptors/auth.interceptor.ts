import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private excludedPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/password/request-reset',
    '/api/auth/reset-password',
    '/api/auth/forgot-password'
  ];

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('🔍 Interceptor - URL:', request.url);


    if (this.isExcludedPath(request.url)) {
      console.log('✅ Ruta excluida del interceptor:', request.url);
      return next.handle(request);
    }

    const token = localStorage.getItem('token');
    console.log('🔑 Token encontrado:', token ? 'SÍ' : 'NO');

    if (token) {
      console.log('✅ Añadiendo token a la solicitud:', request.url);

      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });

      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Error en interceptor:', error);

          if (error.status === 401) {
            console.log('🚫 Token caducado o inválido, redirigiendo al login');
            localStorage.removeItem('token');
            this.router.navigateByUrl('/auth/login');
          }

          return throwError(() => error);
        })
      );
    } else {
      console.warn('⚠️ No hay token disponible para:', request.url);

      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.log('🚫 Sin autenticación, redirigiendo al login');
            this.router.navigateByUrl('/auth/login');
          }
          return throwError(() => error);
        })
      );
    }
  }

  private isExcludedPath(url: string): boolean {
    return this.excludedPaths.some(path => url.includes(path));
  }
}
