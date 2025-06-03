/* import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { TaskList } from '../interfaces/task-list.interface';
import { CreateTaskListDto, UpdateTaskListDto } from '../dto';

import { AuthService } from '../../auth/services/auth-service.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';




@Injectable({
  providedIn: 'root'
})
export class TaskListService {
  private readonly baseUrl: string = `${environment.baseUrl}/api`;
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private authService = inject(AuthService);

  private get userId(): string {
    const user = this.authService.currentUser();
    return user?._id || '';
  }

  getTaskLists(): Observable<TaskList[]> {
    console.log('Getting task lists for user:', this.userId);
    return this.http.get<TaskList[]>(`${this.baseUrl}/users/${this.userId}/task-lists`)
      .pipe(
        tap(lists => console.log('Task lists retrieved:', lists)),
        catchError(err => {
          console.error('Error getting task lists:', err);
          return this.errorHandler.handleError(err);
        })
      );
  }

  getTaskList(id: string): Observable<TaskList> {
    console.log('Getting task list:', id);
    return this.http.get<TaskList>(`${this.baseUrl}/users/${this.userId}/task-lists/${id}`)
      .pipe(
        tap(list => console.log('Task list retrieved:', list)),
        catchError(err => {
          console.error('Error getting task list:', err);
          return this.errorHandler.handleError(err);
        })
      );
  }

  createTaskList(createTaskListDto: CreateTaskListDto): Observable<TaskList> {
    console.log('Creating task list:', createTaskListDto);
    return this.http.post<TaskList>(`${this.baseUrl}/users/${this.userId}/task-lists`, createTaskListDto)
      .pipe(
        tap(list => console.log('Task list created:', list)),
        catchError(err => {
          console.error('Error creating task list:', err);
          return this.errorHandler.handleError(err);
        })
      );
  }

  updateTaskList(id: string, updateTaskListDto: UpdateTaskListDto): Observable<TaskList> {
    console.log('Updating task list:', id, updateTaskListDto);
    return this.http.patch<TaskList>(`${this.baseUrl}/users/${this.userId}/task-lists/${id}`, updateTaskListDto)
      .pipe(
        tap(list => console.log('Task list updated:', list)),
        catchError(err => {
          console.error('Error updating task list:', err);
          return this.errorHandler.handleError(err);
        })
      );
  }

  deleteTaskList(id: string): Observable<{ message: string }> {
    console.log('Deleting task list:', id);
    return this.http.delete<{ message: string }>(`${this.baseUrl}/users/${this.userId}/task-lists/${id}`)
      .pipe(
        tap(resp => console.log('Task list deleted:', resp)),
        catchError(err => {
          console.error('Error deleting task list:', err);
          return this.errorHandler.handleError(err);
        })
      );
  }

  permanentlyDeleteTaskList(id: string): Observable<{ message: string }> {
    console.log('Permanently deleting task list:', id);
    return this.http.delete<{ message: string }>(`${this.baseUrl}/users/${this.userId}/task-lists/${id}/permanent`)
      .pipe(
        tap(resp => console.log('Task list permanently deleted:', resp)),
        catchError(err => {
          console.error('Error permanently deleting task list:', err);
          return this.errorHandler.handleError(err);
        })
      );
  }
} */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { TaskList } from '../interfaces/task-list.interface';
import { CreateTaskListDto, UpdateTaskListDto } from '../dto';
import { AuthService } from '../../auth/services/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class TaskListService {
  private readonly baseUrl: string = `${environment.baseUrl}/api`; // ✅ Con /api
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private taskListsSubject = new BehaviorSubject<TaskList[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public taskLists$ = this.taskListsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  private get userId(): string {
    const user = this.authService.currentUser();
    return user?._id || '';
  }

  constructor() {
    this.loadTaskLists();
  }

  loadTaskLists(): void {
    this.loadingSubject.next(true);
    this.getTaskLists().subscribe({
      next: (taskLists) => {
        this.taskListsSubject.next(taskLists);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error loading task lists:', error);
        this.loadingSubject.next(false);
      }
    });
  }


  getTaskLists(): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`${this.baseUrl}/users/${this.userId}/task-lists`)
      .pipe(
        catchError(err => {
          console.error('Error getting task lists:', err);
          return throwError(() => err.error?.message || 'Error al obtener las listas');
        })
      );
  }


  getTaskList(id: string): Observable<TaskList> {
    return this.http.get<TaskList>(`${this.baseUrl}/users/${this.userId}/task-lists/${id}`)
      .pipe(
        catchError(err => {
          console.error('Error getting task list:', err);
          return throwError(() => err.error?.message || 'Error al obtener la lista');
        })
      );
  }


  createTaskList(createTaskListDto: CreateTaskListDto): Observable<TaskList> {
    return this.http.post<TaskList>(`${this.baseUrl}/users/${this.userId}/task-lists`, createTaskListDto)
      .pipe(
        tap(taskList => {
          const currentLists = this.taskListsSubject.value;
          this.taskListsSubject.next([...currentLists, taskList]);
        }),
        catchError(err => {
          console.error('Error creating task list:', err);
          return throwError(() => err.error?.message || 'Error al crear la lista');
        })
      );
  }


  updateTaskList(id: string, updateTaskListDto: UpdateTaskListDto): Observable<TaskList> {
    return this.http.patch<TaskList>(`${this.baseUrl}/users/${this.userId}/task-lists/${id}`, updateTaskListDto)
      .pipe(
        tap(updatedList => {
          const currentLists = this.taskListsSubject.value;
          const index = currentLists.findIndex(list => list._id === id);
          if (index !== -1) {
            currentLists[index] = updatedList;
            this.taskListsSubject.next([...currentLists]);
          }
        }),
        catchError(err => {
          console.error('Error updating task list:', err);
          return throwError(() => err.error?.message || 'Error al actualizar la lista');
        })
      );
  }


  deleteTaskList(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/users/${this.userId}/task-lists/${id}`)
      .pipe(
        tap(() => {
          const currentLists = this.taskListsSubject.value;
          const filteredLists = currentLists.filter(list => list._id !== id);
          this.taskListsSubject.next(filteredLists);

          console.log('Lista eliminada localmente:', id);
        }),
        catchError(err => {
          console.error('Error deleting task list:', err);

          this.loadTaskLists();
          return throwError(() => err.error?.message || 'Error al eliminar la lista');
        })
      );
  }


  getCurrentTaskLists(): TaskList[] {
    return this.taskListsSubject.value;
  }

  findTaskListById(id: string): TaskList | undefined {
    return this.taskListsSubject.value.find(list => list._id === id);
  }
}
