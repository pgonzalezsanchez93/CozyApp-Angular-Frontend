
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalEventService } from '../../../../../global-events/services/global-event.service';
import { GlobalEvent } from '../../../../../global-events/interfaces/global-event.interface';
import { GlobalEventFormComponent } from '../../../../../global-events/components/global-event-form/global-event-form.component';
import { ConfirmDialogComponent } from '../../../../../shared/component/confirm-dialog/confirm-dialog.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-admin-global-events',
  templateUrl: './admin-global-events.component.html',
  styleUrl: './admin-global-events.component.css'
})
export class AdminGlobalEventsComponent implements OnInit {
   globalEvents: GlobalEvent[] = [];
  loading: boolean = true;
  showInactive: boolean = false;

  constructor(
    private globalEventService: GlobalEventService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadGlobalEvents();
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
    const dialogRef = this.dialog.open(GlobalEventFormComponent, {
      width: '600px',
      maxWidth: '90vw'
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
    const dialogRef = this.dialog.open(GlobalEventFormComponent, {
      width: '600px',
      maxWidth: '90vw',
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que deseas eliminar el evento "${event.title}"?`
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

  getActiveEvents(): GlobalEvent[] {
    return this.globalEvents.filter(e => e.isActive);
  }

  getInactiveEvents(): GlobalEvent[] {
    return this.globalEvents.filter(e => !e.isActive);
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
    return endDate < now;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  trackByEventId(index: number, event: GlobalEvent): string {
    return event._id;
  }
}
