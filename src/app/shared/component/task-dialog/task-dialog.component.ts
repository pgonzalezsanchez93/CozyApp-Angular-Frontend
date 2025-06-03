
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../../tasks/interfaces/task.interface';
import { TaskList } from '../../../task-lists/interfaces/task-list.interface';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';

export interface TaskDialogData {
  task?: Task;
  taskLists: TaskList[];
  selectedDate?: Date;
  mode?: 'create' | 'edit' | 'detail';
}

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.css']
})
export class TaskDialogComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode: boolean = false;
  isDetailMode: boolean = false;
  showEndDate: boolean = false;
  saving: boolean = false;
  taskLists: TaskList[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    private dateAdapter: DateAdapter<Date>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {
    this.taskLists = data.taskLists || [];
    this.isEditMode = !!data.task?._id;
    this.isDetailMode = data.mode === 'detail';
    this.dateAdapter.setLocale('es-ES');
    this.taskForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.task) {
      this.populateForm(this.data.task);
    } else if (this.data.selectedDate) {
      this.taskForm.patchValue({
        dueDate: this.data.selectedDate
      });
    }


    this.taskForm.get('allDay')?.valueChanges.subscribe(value => {
      if (value) {
        // Si es todo el día, limpiar horas
        this.taskForm.patchValue({
          startTime: '',
          endTime: ''
        });
      } else {

        this.taskForm.patchValue({
          startTime: '09:00',
          endTime: '17:00'
        });
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      dueDate: [null],
      endDate: [null],
      startTime: ['09:00'],
      endTime: ['17:00'],
      priority: ['medium'],
      status: ['pending'],
      listId: [null],
      allDay: [true]
    });
  }


  private populateForm(task: Task): void {
    this.showEndDate = !!task.endDate;

    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      endDate: task.endDate ? new Date(task.endDate) : null,
      startTime: this.extractTime(task.dueDate) || '09:00',
      endTime: this.extractTime(task.endDate) || '17:00',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      listId: task.listId || null,
      allDay: task.allDay !== undefined ? task.allDay : true
    });
  }


  private extractTime(date: Date | string | undefined): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }


  toggleEndDate(): void {
    this.showEndDate = !this.showEndDate;
    if (!this.showEndDate) {
      this.taskForm.patchValue({
        endDate: null,
        endTime: this.isAllDay ? '' : '17:00'
      });
    } else if (!this.taskForm.get('endDate')?.value) {

      const startDate = this.taskForm.get('dueDate')?.value;
      this.taskForm.patchValue({
        endDate: startDate || new Date()
      });
    }
  }


  onCancel(): void {
    this.dialogRef.close();
  }


  onSave(): void {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formValue = this.taskForm.value;

    const taskData: any = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || '',
      priority: formValue.priority,
      status: formValue.status,
      listId: formValue.listId || null,
      allDay: formValue.allDay
    };

    if (formValue.dueDate) {
      taskData.dueDate = this.processDate(formValue.dueDate, formValue.startTime);
    }

    if (this.showEndDate && formValue.endDate) {
      taskData.endDate = this.processDate(formValue.endDate, formValue.endTime);
    }


    if (!formValue.allDay) {
      if (formValue.startTime) {
        taskData.startTime = formValue.startTime;
      }
      if (formValue.endTime) {
        taskData.endTime = formValue.endTime;
      }
    }


    setTimeout(() => {
      this.saving = false;
      this.dialogRef.close(taskData);
    }, 800);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  private processDate(date: Date, time?: string): Date {
    const processedDate = new Date(date);

    if (!this.taskForm.get('allDay')?.value && time) {
      const [hours, minutes] = time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        processedDate.setHours(hours, minutes, 0, 0);
      }
    } else {
      processedDate.setHours(0, 0, 0, 0);
    }

    return processedDate;
  }


  get isAllDay(): boolean {
    return this.taskForm.get('allDay')?.value || false;
  }


  onCompleteTask(): void {
    this.dialogRef.close({
      action: 'complete',
      task: this.data.task
    });
  }

  onEditTask(): void {
    this.dialogRef.close({
      action: 'edit',
      task: this.data.task
    });
  }

  onDeleteTask(): void {
    this.dialogRef.close({
      action: 'delete',
      task: this.data.task
    });
  }


  getTaskListName(): string {
    if (!this.data.task?.listId) return 'Sin lista';
    const list = this.taskLists.find(l => l._id === this.data.task?.listId);
    return list?.name || 'Sin lista';
  }


  getTaskListColor(): string {
    if (!this.data.task?.listId) return '#666';
    const list = this.taskLists.find(l => l._id === this.data.task?.listId);
    return list?.color || '#666';
  }


  formatDate(date: Date | string | undefined): string {
    if (!date) return 'No definida';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCheck = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());


    const diffDays = Math.floor((dateToCheck.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let dateStr = '';
    if (diffDays === 0) {
      dateStr = 'Hoy';
    } else if (diffDays === 1) {
      dateStr = 'Mañana';
    } else if (diffDays === -1) {
      dateStr = 'Ayer';
    } else {
      dateStr = dateObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }


    if (this.data.task && !this.data.task.allDay) {
      const timeStr = dateObj.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      dateStr += ` a las ${timeStr}`;
    }

    return dateStr;
  }


  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return labels[priority] || 'Media';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      high: '#f44336',
      medium: '#ff9800',
      low: '#4caf50'
    };
    return colors[priority] || '#ff9800';
  }


  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      in_progress: 'En progreso',
      completed: 'Completada'
    };
    return labels[status] || 'Pendiente';
  }


  isOverdue(): boolean {
    if (!this.data.task?.dueDate ||
        this.data.task?.status === 'completed' ||
        this.data.task?.isCompleted) {
      return false;
    }

    const now = new Date();
    const dueDate = new Date(this.data.task.dueDate);

    if (this.data.task.allDay) {

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      return taskDate < today;
    } else {

      return dueDate < now;
    }
  }


  isMultiDayTask(): boolean {
    if (!this.data.task?.dueDate || !this.data.task?.endDate) {
      return false;
    }

    const startDate = new Date(this.data.task.dueDate);
    const endDate = new Date(this.data.task.endDate);

    return startDate.toDateString() !== endDate.toDateString();
  }


  getTaskDuration(): string {
    if (!this.data.task?.dueDate) {
      return 'No definida';
    }

    if (this.data.task.allDay) {
      if (this.data.task.endDate && this.isMultiDayTask()) {
        const startDate = new Date(this.data.task.dueDate);
        const endDate = new Date(this.data.task.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
      }
      return 'Todo el día';
    }

    if (this.data.task.startTime && this.data.task.endTime) {
      const [startHour, startMin] = this.data.task.startTime.split(':').map(Number);
      const [endHour, endMin] = this.data.task.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const durationMinutes = endMinutes - startMinutes;

      if (durationMinutes > 0) {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}min`;
        } else if (hours > 0) {
          return `${hours}h`;
        } else {
          return `${minutes}min`;
        }
      }
    }

    return 'Duración no especificada';
  }
}
