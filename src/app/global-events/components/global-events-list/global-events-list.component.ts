import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalEventService } from '../../services/global-event.service';

import { GlobalEventFormComponent } from '../global-event-form/global-event-form.component';

import { AuthService } from '../../../auth/services/auth-service.service';
import Swal from 'sweetalert2';
import { GlobalEvent } from '../../interfaces/global-event.interface';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-global-events-list',
  templateUrl: './global-events-list.component.html',
  styleUrls: ['./global-events-list.component.css']
})
export class GlobalEventsListComponent implements OnInit {
  globalEvents: GlobalEvent[] = [];
  loading: boolean = true;
  isAdmin: boolean = false;
  showInactive: boolean = false;

  constructor(
    private globalEventService: GlobalEventService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkAdminRole();
    this.loadGlobalEvents();
  }

  checkAdminRole(): void {
    const user = this.authService.currentUser();
    this.isAdmin = user?.roles.includes('admin') || false;
  }
  getActiveEvents(): GlobalEvent[] {
    return this.globalEvents.filter(e => e.isActive);
  }

  getInactiveEvents(): GlobalEvent[] {
    return this.globalEvents.filter(e => !e.isActive);
  }

  hasInactiveEvents(): boolean {
    return this.getInactiveEvents().length > 0;
  }

  loadGlobalEvents(): void {
    this.loading = true;
    this.globalEventService.getGlobalEvents(this.showInactive).subscribe({
      next: (events) => {
        this.globalEvents = events;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading global events', error);
        Swal.fire('Error', 'No se pudieron cargar los eventos globales', 'error');
        this.loading = false;
      }
    });
  }

  toggleShowInactive(): void {
    this.showInactive = !this.showInactive;
    this.loadGlobalEvents();
  }

  createGlobalEvent(): void {
    if (!this.isAdmin) {
      Swal.fire('Acceso denegado', 'Solo los administradores pueden crear eventos globales', 'warning');
      return;
    }

    const dialogRef = this.dialog.open(GlobalEventFormComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.globalEventService.createGlobalEvent(result).subscribe({
          next: (newEvent) => {
            this.globalEvents.push(newEvent);
            Swal.fire('Éxito', 'Evento global creado correctamente', 'success');
          },
          error: (error) => {
            console.error('Error creating global event', error);
            Swal.fire('Error', 'No se pudo crear el evento global', 'error');
          }
        });
      }
    });
  }

  editGlobalEvent(event: GlobalEvent): void {
    if (!this.isAdmin) {
      Swal.fire('Acceso denegado', 'Solo los administradores pueden editar eventos globales', 'warning');
      return;
    }

    const dialogRef = this.dialog.open(GlobalEventFormComponent, {
      width: '500px',
      data: { globalEvent: event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.globalEventService.updateGlobalEvent(event._id, result).subscribe({
          next: (updatedEvent) => {
            const index = this.globalEvents.findIndex(e => e._id === event._id);
            if (index !== -1) {
              this.globalEvents[index] = updatedEvent;
            }
            Swal.fire('Éxito', 'Evento global actualizado correctamente', 'success');
          },
          error: (error) => {
            console.error('Error updating global event', error);
            Swal.fire('Error', 'No se pudo actualizar el evento global', 'error');
          }
        });
      }
    });
  }

  deleteGlobalEvent(event: GlobalEvent): void {
    if (!this.isAdmin) {
      Swal.fire('Acceso denegado', 'Solo los administradores pueden eliminar eventos globales', 'warning');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar evento global',
        message: `¿Estás seguro de que deseas eliminar el evento "${event.title}"?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.globalEventService.deleteGlobalEvent(event._id).subscribe({
          next: () => {
            this.globalEvents = this.globalEvents.filter(e => e._id !== event._id);
            Swal.fire('Éxito', 'Evento global eliminado correctamente', 'success');
          },
          error: (error) => {
            console.error('Error deleting global event', error);
            Swal.fire('Error', 'No se pudo eliminar el evento global', 'error');
          }
        });
      }
    });
  }

  isEventActive(event: GlobalEvent): boolean {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return event.isActive && startDate <= now && endDate >= now;
  }

  isEventUpcoming(event: GlobalEvent): boolean {
    const now = new Date();
    const startDate = new Date(event.startDate);
    return event.isActive && startDate > now;
  }

  isEventPast(event: GlobalEvent): boolean {
    const now = new Date();
    const endDate = new Date(event.endDate);
    return event.isActive && endDate < now;
  }
}
