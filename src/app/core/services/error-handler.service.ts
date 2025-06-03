import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }


  public handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {

      errorMessage = `Error: ${error.error.message}`;
      console.error('Client-side error:', error.error.message);
    } else {

      if (error.status === 401) {
        errorMessage = 'No estás autorizado para realizar esta acción. Por favor, inicia sesión nuevamente.';
        console.error('Authentication error:', error);
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado.';
        console.error('Resource not found:', error);
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
        console.error('Internal server error');
      } else {

        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
        console.error(`Server error ${error.status}:`, error.error);
      }
    }


    console.log('Error completo:', error);

    return throwError(() => errorMessage);
  }


  public showError(message: string): void {
    import('../_helpers/sweetalert-helper').then(helper => {
      helper.showErrorMessage(message);
    }).catch(() => {
      console.error('Error al cargar el helper de SweetAlert2', message);

      alert(`Error: ${message}`);
    });
  }
}
