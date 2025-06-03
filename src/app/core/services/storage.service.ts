import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }


  setItem(key: string, value: any): void {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error al guardar en el localStorage', error);
    }
  }


  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      try {

        return JSON.parse(item);
      } catch {

        return item as unknown as T;
      }
    } catch (error) {
      console.error('Error al buscarlo en el localStorage', error);
      return defaultValue;
    }
  }


  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error al borrarlo del localStorage', error);
    }
  }


  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
}
