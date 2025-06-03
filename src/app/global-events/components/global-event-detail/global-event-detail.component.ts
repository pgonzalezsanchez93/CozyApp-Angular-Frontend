import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GlobalEventService } from '../../services/global-event.service';

import { GlobalEventFormComponent } from '../global-event-form/global-event-form.component';

import { AuthService } from '../../../auth/services/auth-service.service';
import Swal from 'sweetalert2';
import { GlobalEvent } from '../../interfaces/global-event.interface';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-global-event-detail',
  templateUrl: './global-event-detail.component.html',
  styleUrls: ['./global-event-detail.component.css']
})
export class GlobalEventDetailComponent implements OnInit {
  globalEvent: GlobalEvent | null = null;
  loading: boolean = true;
  isAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalEventService: GlobalEventService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkAdminRole();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadGlobalEvent(params['id']);
      }
    });
  }

  checkAdminRole(): void {
    const user = this.authService.currentUser();
    this.isAdmin = user?.roles.includes('admin') || false;
  }
  getDurationInDays(): number {
    if (!this.globalEvent) return 0;

    const start = new Date(this.globalEvent.startDate);
    const end = new Date(this.globalEvent.endDate);

    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return Math.round(diffInDays);
  }

  loadGlobalEvent(id: string): void {
    this.loading = true;
    this.globalEventService.getGlobalEvent(id).subscribe({
      next: (event) => {
        this.globalEvent = event;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading global event', error);
        Swal.fire('Error', 'No se pudo cargar el evento global', 'error');
        this.loading = false;
        this.router.navigate(['/global-events']);
      }
    });
  }

  editGlobalEvent(): void {
    if (!this.isAdmin || !this.globalEvent) {
      Swal.fire('Acceso denegado', 'Solo los administradores pueden editar eventos globales', 'warning');
      return;
    }

    const dialogRef = this.dialog.open(GlobalEventFormComponent, {
      width: '500px',
      data: { globalEvent: this.globalEvent }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.globalEventService.updateGlobalEvent(this.globalEvent!._id, result).subscribe({
          next: (updatedEvent) => {
            this.globalEvent = updatedEvent;
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

  deleteGlobalEvent(): void {
    if (!this.isAdmin || !this.globalEvent) {
      Swal.fire('Acceso denegado', 'Solo los administradores pueden eliminar eventos globales', 'warning');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar evento global',
        message: `¿Estás seguro de que deseas eliminar el evento "${this.globalEvent.title}"?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.globalEventService.deleteGlobalEvent(this.globalEvent!._id).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Evento global eliminado correctamente', 'success');
            this.router.navigate(['/global-events']);
          },
          error: (error) => {
            console.error('Error deleting global event', error);
            Swal.fire('Error', 'No se pudo eliminar el evento global', 'error');
          }
        });
      }
    });
  }

  isEventActive(): boolean {
    if (!this.globalEvent) return false;

    const now = new Date();
    const startDate = new Date(this.globalEvent.startDate);
    const endDate = new Date(this.globalEvent.endDate);
    return this.globalEvent.isActive && startDate <= now && endDate >= now;
  }

  isEventUpcoming(): boolean {
    if (!this.globalEvent) return false;

    const now = new Date();
    const startDate = new Date(this.globalEvent.startDate);
    return this.globalEvent.isActive && startDate > now;
  }

  isEventPast(): boolean {
    if (!this.globalEvent) return false;

    const now = new Date();
    const endDate = new Date(this.globalEvent.endDate);
    return this.globalEvent.isActive && endDate < now;
  }

  goBack(): void {
    this.router.navigate(['/global-events']);
  }
}
