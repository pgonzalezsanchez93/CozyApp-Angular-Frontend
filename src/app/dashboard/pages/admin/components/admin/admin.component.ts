import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
   navLinks = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: 'users', label: 'Usuarios', icon: 'people' },
    { path: 'global-events', label: 'Eventos Globales', icon: 'event' },
    { path: 'settings', label: 'Configuración', icon: 'settings' }
  ];
}
