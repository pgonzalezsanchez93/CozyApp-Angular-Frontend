import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { AuthService } from '../../auth/services/auth-service.service';

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api`;
  
  private currentThemeSubject = new BehaviorSubject<string>('default');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private availableThemes: Theme[] = [
    {
      id: 'default',
      name: 'Predeterminado',
      description: 'Tema clásico azul con colores equilibrados',
      primaryColor: '#3f51b5'
    },
    {
      id: 'ocean',
      name: 'Océano',
      description: 'Inspirado en los tonos del mar y la tranquilidad',
      primaryColor: '#0277bd'
    },
    {
      id: 'nature',
      name: 'Naturaleza',
      description: 'Colores verdes frescos inspirados en la naturaleza',
      primaryColor: '#2e7d32'
    },
    {
      id: 'cozy',
      name: 'Acogedor',
      description: 'Tonos cálidos y acogedores para una experiencia relajante',
      primaryColor: '#e38054'
    }
  ];

  constructor() {
    this.loadSavedTheme();
  }

  setTheme(themeId: string): void {
    const body = document.body;
    
    this.availableThemes.forEach(theme => {
      body.classList.remove(`theme-${theme.id}`);
    });
    
  
    body.classList.add(`theme-${themeId}`);
    

    localStorage.setItem('selectedTheme', themeId);

    this.currentThemeSubject.next(themeId);
  }

  getCurrentTheme(): string {
    return this.currentThemeSubject.value;
  }

  getAvailableThemes(): Observable<Theme[]> {
    return of(this.availableThemes);
  }

  updateUserTheme(themeId: string): Observable<any> {
    
    this.setTheme(themeId);

    return this.http.put(`${this.baseUrl}/auth/preferences`, { 
      theme: themeId 
    }).pipe(
      catchError(error => {
        console.error('Error actualizando tema en el servidor:', error);
       
        return of({ success: false, error: 'No se pudo guardar en el servidor' });
      })
    );
  }

  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && this.availableThemes.some(theme => theme.id === savedTheme)) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('default');
    }
  }
}