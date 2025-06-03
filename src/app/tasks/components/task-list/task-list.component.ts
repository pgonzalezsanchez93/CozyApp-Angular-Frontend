

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { TaskService } from '../../services/task.service';
import { TaskListService } from '../../../task-lists/services/task-list.service';
import { Task } from '../../interfaces/task.interface';
import { TaskList } from '../../../task-lists/interfaces/task-list.interface';
import { TaskDialogComponent } from '../../../shared/component/task-dialog/task-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  @Input() selectedListId?: string;
  @Input() pageTitle: string = 'Tareas';

  private destroy$ = new Subject<void>();

  tasks: Task[] = [];
  taskLists: TaskList[] = [];
  filteredTasks: Task[] = [];
  loading: boolean = false;

  searchTerm: string = '';
  statusFilter: string = 'all';
  priorityFilter: string = 'all';
  listFilter: string = 'all';
  dateFilter: string = 'all';

  viewMode: 'list' | 'grid' = 'list';

  selectedList?: TaskList;

  constructor(
    private taskService: TaskService,
    private taskListService: TaskListService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadViewMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;

    combineLatest([
      this.taskService.tasks$,
      this.taskListService.taskLists$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([tasks, taskLists]) => {
        this.tasks = tasks;
        this.taskLists = taskLists;

        if (this.selectedListId) {
          this.selectedList = taskLists.find(list => list._id === this.selectedListId);
          this.listFilter = this.selectedListId;
        }

        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.loading = false;
      }
    });
  }

  private loadViewMode(): void {
    const savedViewMode = localStorage.getItem('taskViewMode') as 'list' | 'grid';
    if (savedViewMode) {
      this.viewMode = savedViewMode;
    }
  }

  applyFilters(): void {
    let filtered = [...this.tasks];

    if (this.selectedListId) {
      filtered = filtered.filter(task => task.listId === this.selectedListId);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term))
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === this.statusFilter);
    }

    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === this.priorityFilter);
    }

    if (this.listFilter !== 'all' && !this.selectedListId) {
      if (this.listFilter === 'none') {
        filtered = filtered.filter(task => !task.listId);
      } else {
        filtered = filtered.filter(task => task.listId === this.listFilter);
      }
    }

    if (this.dateFilter !== 'all') {
      filtered = this.applyDateFilter(filtered);
    }

    filtered.sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'completed') return 1;
        if (b.status === 'completed') return -1;
      }

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return 0;
    });

    this.filteredTasks = filtered;
  }

  private applyDateFilter(tasks: Task[]): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);

    switch (this.dateFilter) {
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });

      case 'tomorrow':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === tomorrow.getTime();
        });

      case 'this_week':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate <= weekEnd;
        });

      case 'overdue':
        return tasks.filter(task => this.isOverdue(task));

      case 'no_date':
        return tasks.filter(task => !task.dueDate);

      default:
        return tasks;
    }
  }

  onViewModeChange(): void {
    localStorage.setItem('taskViewMode', this.viewMode);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.priorityFilter = 'all';
    this.dateFilter = 'all';
    if (!this.selectedListId) {
      this.listFilter = 'all';
    }
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' ||
           this.statusFilter !== 'all' ||
           this.priorityFilter !== 'all' ||
           this.dateFilter !== 'all' ||
           (this.listFilter !== 'all' && !this.selectedListId);
  }

  openTaskDialog(task?: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        task: task,
        taskLists: this.taskLists
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (task) {
          this.taskService.updateTask(task._id, result).subscribe();
        } else {
          if (this.selectedListId) {
            result.listId = this.selectedListId;
          }
          this.taskService.createTask(result).subscribe();
        }
      }
    });
  }

  toggleTaskCompletion(task: Task): void {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    this.taskService.updateTask(task._id, {
      status: newStatus,
      isCompleted: newStatus === 'completed',
      completedAt: newStatus === 'completed' ? new Date() : undefined
    }).subscribe();
  }

  duplicateTask(task: Task): void {
    const duplicatedTask = {
      title: `${task.title} (copia)`,
      description: task.description,
      priority: task.priority,
      listId: task.listId,
      dueDate: task.dueDate,
      endDate: task.endDate,
      allDay: task.allDay
    };

    this.taskService.createTask(duplicatedTask).subscribe();
  }

  deleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(task._id).subscribe();
      }
    });
  }

  deleteCompletedTasks(): void {
    const completedCount = this.getCompletedCount();

    if (completedCount === 0) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que quieres eliminar ${completedCount} tarea${completedCount !== 1 ? 's' : ''} completada${completedCount !== 1 ? 's' : ''}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteCompletedTasks().subscribe({
          next: (response) => {
            console.log('Tareas completadas eliminadas:', response);
          },
          error: (error) => {
            console.error('Error eliminando tareas completadas:', error);
          }
        });
      }
    });
  }

  markAllAsCompleted(): void {
    const pendingTasks = this.filteredTasks.filter(task => task.status !== 'completed');

    if (pendingTasks.length === 0) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que quieres marcar ${pendingTasks.length} tarea${pendingTasks.length !== 1 ? 's' : ''} como completada${pendingTasks.length !== 1 ? 's' : ''}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        pendingTasks.forEach(task => {
          this.taskService.updateTask(task._id, {
            status: 'completed',
            isCompleted: true,
            completedAt: new Date()
          }).subscribe();
        });
      }
    });
  }

  getCompletedCount(): number {
    return this.filteredTasks.filter(task => task.status === 'completed').length;
  }

  getPendingCount(): number {
    return this.filteredTasks.filter(task => task.status !== 'completed').length;
  }

  getOverdueCount(): number {
    return this.filteredTasks.filter(task => this.isOverdue(task)).length;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return labels[priority] || 'Media';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      in_progress: 'En progreso',
      completed: 'Completada'
    };
    return labels[status] || 'Pendiente';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      pending: 'schedule',
      in_progress: 'play_circle',
      completed: 'check_circle'
    };
    return icons[status] || 'schedule';
  }

  getDateFilterLabel(filter: string): string {
    const labels: { [key: string]: string } = {
      today: 'Hoy',
      tomorrow: 'Mañana',
      this_week: 'Esta semana',
      overdue: 'Vencidas',
      no_date: 'Sin fecha'
    };
    return labels[filter] || filter;
  }

  getListName(listId: string): string {
    const list = this.taskLists.find(l => l._id === listId);
    return list?.name || '';
  }

  getTaskListName(task: Task): string {
    if (!task.listId) return '';
    const list = this.taskLists.find(l => l._id === task.listId);
    return list?.name || '';
  }

  getTaskListIcon(task: Task): string {
    if (!task.listId) return '';
    const list = this.taskLists.find(l => l._id === task.listId);
    return list?.icon || 'list';
  }

  getTaskListColor(task: Task): string {
    if (!task.listId) return '#666';
    const list = this.taskLists.find(l => l._id === task.listId);
    return list?.color || '#666';
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  }

  formatDueDate(date: Date): string {
    const now = new Date();
    const dueDate = new Date(date);
    const diffInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Mañana';
    if (diffInDays === -1) return 'Ayer';
    if (diffInDays < -1) return `Hace ${Math.abs(diffInDays)} días`;
    if (diffInDays < 7) return `En ${diffInDays} días`;

    return dueDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: dueDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  trackByTaskId(index: number, task: Task): string {
    return task._id;
  }
}
