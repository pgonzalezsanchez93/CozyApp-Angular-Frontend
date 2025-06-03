import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, from, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Task } from '../interfaces/task.interface';
import { CreateTaskDto, UpdateTaskDto } from '../dto';
import { AuthService } from '../../auth/services/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly baseUrl: string = `${environment.baseUrl}/api`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public tasks$ = this.tasksSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  private get userId(): string {
    const user = this.authService.currentUser();
    return user?._id || '';
  }

  constructor() {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loadingSubject.next(true);
    this.getTasks().subscribe({
      next: (tasks) => {
        this.tasksSubject.next(tasks);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loadingSubject.next(false);
      }
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/users/${this.userId}/tasks`)
      .pipe(
        map(tasks => tasks.map(task => this.mapTaskDates(task))),
        catchError(err => {
          console.error('Error getting tasks:', err);
          return throwError(() => err.error?.message || 'Error al obtener tareas');
        })
      );
  }

  getPendingTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/users/${this.userId}/tasks/pending`)
      .pipe(
        map(tasks => tasks.map(task => this.mapTaskDates(task))),
        catchError(err => {
          console.error('Error getting pending tasks:', err);
          return throwError(() => err.error?.message || 'Error al obtener tareas pendientes');
        })
      );
  }

  getOverdueTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/users/${this.userId}/tasks/overdue`)
      .pipe(
        map(tasks => tasks.map(task => this.mapTaskDates(task))),
        catchError(err => {
          console.error('Error getting overdue tasks:', err);
          return throwError(() => err.error?.message || 'Error al obtener tareas vencidas');
        })
      );
  }

  getTodayTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/users/${this.userId}/tasks/today`)
      .pipe(
        map(tasks => tasks.map(task => this.mapTaskDates(task))),
        catchError(err => {
          console.error('Error getting today tasks:', err);
          return throwError(() => err.error?.message || 'Error al obtener tareas de hoy');
        })
      );
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/users/${this.userId}/tasks/${id}`)
      .pipe(
        map(task => this.mapTaskDates(task)),
        catchError(err => {
          console.error('Error getting task:', err);
          return throwError(() => err.error?.message || 'Error al obtener la tarea');
        })
      );
  }

  createTask(createTaskDto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/users/${this.userId}/tasks`, createTaskDto)
      .pipe(
        map(task => this.mapTaskDates(task)),
        tap(task => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([...currentTasks, task]);
        }),
        catchError(err => {
          console.error('Error creating task:', err);
          return throwError(() => err.error?.message || 'Error al crear la tarea');
        })
      );
  }

  updateTask(id: string, updateTaskDto: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/users/${this.userId}/tasks/${id}`, updateTaskDto)
      .pipe(
        map(task => this.mapTaskDates(task)),
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const index = currentTasks.findIndex(t => t._id === id);
          if (index !== -1) {
            currentTasks[index] = updatedTask;
            this.tasksSubject.next([...currentTasks]);
          }
        }),
        catchError(err => {
          console.error('Error updating task:', err);
          return throwError(() => err.error?.message || 'Error al actualizar la tarea');
        })
      );
  }

  deleteTask(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/users/${this.userId}/tasks/${id}`)
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const filteredTasks = currentTasks.filter(t => t._id !== id);
          this.tasksSubject.next(filteredTasks);
        }),
        catchError(err => {
          console.error('Error deleting task:', err);
          return throwError(() => err.error?.message || 'Error al eliminar la tarea');
        })
      );
  }

  // Nuevo método: Eliminar todas las tareas completadas
  deleteCompletedTasks(): Observable<{ message: string; deletedCount: number }> {
    return this.http.delete<{ message: string; deletedCount: number }>(`${this.baseUrl}/users/${this.userId}/tasks/completed/all`)
      .pipe(
        tap(() => {
          // Actualizar el estado local removiendo las tareas completadas
          const currentTasks = this.tasksSubject.value;
          const activeTasks = currentTasks.filter(t => !t.isCompleted);
          this.tasksSubject.next(activeTasks);
        }),
        catchError(err => {
          console.error('Error deleting completed tasks:', err);
          return throwError(() => err.error?.message || 'Error al eliminar tareas completadas');
        })
      );
  }

  // Nuevo método: Marcar todas las tareas como completadas
  markAllTasksAsCompleted(): Observable<{ message: string; modifiedCount: number }> {
    return this.http.patch<{ message: string; modifiedCount: number }>(`${this.baseUrl}/users/${this.userId}/tasks/complete/all`, {})
      .pipe(
        tap(() => {
          // Actualizar el estado local marcando todas las tareas como completadas
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task => ({
            ...task,
            isCompleted: true,
            status: 'completed' as const,
            completedAt: new Date()
          }));
          this.tasksSubject.next(updatedTasks);
        }),
        catchError(err => {
          console.error('Error marking all tasks as completed:', err);
          return throwError(() => err.error?.message || 'Error al marcar todas las tareas como completadas');
        })
      );
  }

  private mapTaskDates(task: Task): Task {
    return {
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      endDate: task.endDate ? new Date(task.endDate) : undefined,
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    };
  }

  getCurrentTasks(): Task[] {
    return this.tasksSubject.value;
  }

  getTasksByList(listId: string): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(task => task.listId === listId))
    );
  }

  toggleTaskCompletion(taskId: string, isCompleted: boolean): Observable<Task> {
    return this.updateTask(taskId, {
      status: isCompleted ? 'completed' : 'pending',
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined
    });
  }
}
