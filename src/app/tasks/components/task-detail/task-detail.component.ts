import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { TaskListService } from '../../../task-lists/services/task-list.service';

import Swal from 'sweetalert2';
import { Task } from '../../interfaces/task.interface';
import { TaskList } from '../../../task-lists/interfaces/task-list.interface';
import { TaskDialogComponent } from '../../../shared/component/task-dialog/task-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  taskList: TaskList | null = null;
  taskLists: TaskList[] = [];
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private taskListService: TaskListService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTaskLists();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadTask(params['id']);
      }
    });
  }

  loadTask(id: string): void {
    this.loading = true;
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.task = task;
        if (task.listId) {
          this.loadTaskList(task.listId);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading task', error);
        Swal.fire('Error', 'No se pudo cargar la tarea', 'error');
        this.loading = false;
        this.router.navigate(['/dashboard/tasks']);
      }
    });
  }

  loadTaskList(listId: string): void {
    this.taskListService.getTaskList(listId).subscribe({
      next: (list) => {
        this.taskList = list;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading task list', error);
        this.loading = false;
      }
    });
  }

  loadTaskLists(): void {
    this.taskListService.getTaskLists().subscribe({
      next: (lists) => {
        this.taskLists = lists;
      },
      error: (error) => {
        console.error('Error loading task lists', error);
      }
    });
  }

  editTask(): void {
    if (!this.task) return;

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { 
        task: this.task, 
        taskLists: this.taskLists,
        startTime: this.task.startTime,
        endTime: this.task.endTime,
        isAllDay: !this.task.startTime && !this.task.endTime
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.updateTask(this.task!._id, result).subscribe({
          next: (updatedTask) => {
            this.task = updatedTask;
            if (updatedTask.listId && (!this.taskList || updatedTask.listId !== this.taskList._id)) {
              this.loadTaskList(updatedTask.listId);
            } else if (!updatedTask.listId) {
              this.taskList = null;
            }
            Swal.fire('Éxito', 'Tarea actualizada correctamente', 'success');
          },
          error: (error) => {
            console.error('Error updating task', error);
            Swal.fire('Error', 'No se pudo actualizar la tarea', 'error');
          }
        });
      }
    });
  }

  deleteTask(): void {
    if (!this.task) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar tarea',
        message: `¿Estás seguro de que deseas eliminar la tarea "${this.task.title}"?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(this.task!._id).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Tarea eliminada correctamente', 'success');
            this.router.navigate(['/dashboard/tasks']);
          },
          error: (error) => {
            console.error('Error deleting task', error);
            Swal.fire('Error', 'No se pudo eliminar la tarea', 'error');
          }
        });
      }
    });
  }

  toggleTaskCompletion(): void {
    if (!this.task) return;

    const updatedStatus = !this.task.isCompleted;

    this.taskService.toggleTaskCompletion(this.task._id, updatedStatus).subscribe({
      next: (updatedTask) => {
        this.task = updatedTask;
        Swal.fire({
          icon: 'success',
          title: updatedTask.isCompleted ? 'Tarea completada' : 'Tarea pendiente',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (error) => {
        console.error('Error updating task status', error);
        Swal.fire('Error', 'No se pudo actualizar el estado de la tarea', 'error');
      }
    });
  }

  isOverdue(): boolean {
    if (!this.task || !this.task.dueDate || this.task.isCompleted) return false;
    const dueDate = new Date(this.task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/tasks']);
  }
}