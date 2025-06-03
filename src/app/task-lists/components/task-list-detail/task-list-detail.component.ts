import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TaskListService } from '../../services/task-list.service';
import { TaskService } from '../../../tasks/services/task.service';

import { TaskListFormComponent } from '../task-list-form/task-list-form.component';
import Swal from 'sweetalert2';
import { TaskDialogComponent } from '../../../shared/component/task-dialog/task-dialog.component';
import { TaskList } from '../../interfaces/task-list.interface';
import { Task } from '../../../tasks/interfaces/task.interface';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-list-detail',
  templateUrl: './task-list-detail.component.html',
  styleUrls: ['./task-list-detail.component.css']
})
export class TaskListDetailComponent implements OnInit {
  taskList: TaskList | null = null;
  tasks: Task[] = [];
  loading: boolean = true;
  taskFilter: 'all' | 'pending' | 'completed' = 'all';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskListService: TaskListService,
    private taskService: TaskService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadTaskList(params['id']);
      }
    });
  }

  loadTaskList(id: string): void {
    this.loading = true;
    this.taskListService.getTaskList(id).subscribe({
      next: (list) => {
        this.taskList = list;
        this.loadTasks(list._id);
      },
      error: (error) => {
        console.error('Error loading task list', error);
        Swal.fire('Error', 'No se pudo cargar la lista de tareas', 'error');
        this.loading = false;
        this.router.navigate(['/task-lists']);
      }
    });
  }

  loadTasks(listId: string): void {
    this.taskService.getTasksByList(listId).subscribe({
      next: (tasks: Task[]) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading tasks', error);
        Swal.fire('Error', 'No se pudieron cargar las tareas de esta lista', 'error');
        this.loading = false;
      }
    });
  }

  editTaskList(): void {
    if (!this.taskList) return;

    const dialogRef = this.dialog.open(TaskListFormComponent, {
      width: '500px',
      data: { taskList: this.taskList }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskListService.updateTaskList(this.taskList!._id, result).subscribe({
          next: (updatedList) => {
            this.taskList = updatedList;
            Swal.fire('Éxito', 'Lista actualizada correctamente', 'success');
          },
          error: (error) => {
            console.error('Error updating task list', error);
            Swal.fire('Error', 'No se pudo actualizar la lista', 'error');
          }
        });
      }
    });
  }

  deleteTaskList(): void {
    if (!this.taskList) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar lista',
        message: `¿Estás seguro de que deseas eliminar la lista "${this.taskList.name}"?
                 ${this.tasks.length > 0 ? `Esta lista contiene ${this.tasks.length} tarea(s).` : ''}
                 Las tareas asociadas a esta lista no se eliminarán, pero perderán la referencia a esta lista.`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskListService.deleteTaskList(this.taskList!._id).subscribe({
          next: () => {

            this.tasks.forEach(task => {
              const updatedTask = { ...task, listId: undefined };
              this.taskService.updateTask(task._id, updatedTask).subscribe();
            });

            Swal.fire('Éxito', 'Lista eliminada correctamente', 'success');
            this.router.navigate(['/task-lists']);
          },
          error: (error) => {
            console.error('Error deleting task list', error);
            Swal.fire('Error', 'No se pudo eliminar la lista', 'error');
          }
        });
      }
    });
  }

  toggleTaskCompletion(task: Task): void {
    const updatedStatus = !task.isCompleted;

    this.taskService.toggleTaskCompletion(task._id, updatedStatus).subscribe({
      next: (updatedTask: Task) => {
        const index = this.tasks.findIndex(t => t._id === task._id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      },
      error: (error: any) => {
        console.error('Error updating task status', error);
        Swal.fire('Error', 'No se pudo actualizar el estado de la tarea', 'error');
      }
    });
  }
  createTask(): void {
    if (!this.taskList) return;

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: {
        taskLists: [this.taskList],
        preselectedListId: this.taskList._id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ensure the task is associated with this list
        result.listId = this.taskList!._id;

        this.taskService.createTask(result).subscribe({
          next: (task) => {
            this.tasks.unshift(task);
            Swal.fire('Éxito', 'Tarea creada correctamente', 'success');
          },
          error: (error) => {
            console.error('Error creating task', error);
            Swal.fire('Error', 'No se pudo crear la tarea', 'error');
          }
        });
      }
    });
  }

  goToTaskDetail(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }
  getPendingTasks(): Task[] {
    return this.tasks.filter(task => !task.isCompleted);
  }

  getPendingTasksCount(): number {
    return this.getPendingTasks().length;
  }

  getCompletedTasks(): Task[] {
    return this.tasks.filter(task => task.isCompleted);
  }

  getCompletedTasksCount(): number {
    return this.getCompletedTasks().length;
  }

  filterTasks(): Task[] {
    switch(this.taskFilter) {
      case 'pending':
        return this.tasks.filter(task => !task.isCompleted);
      case 'completed':
        return this.tasks.filter(task => task.isCompleted);
      default:
        return this.tasks;
    }
  }


  goBack(): void {
    this.router.navigate(['/task-lists']);
  }
}
