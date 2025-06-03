import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { TaskListService } from '../../services/task-list.service';
import { TaskService } from '../../../tasks/services/task.service';
import { TaskList } from '../../interfaces/task-list.interface';
import { Task } from '../../../tasks/interfaces/task.interface';
import { TaskListDialogComponent } from '../../../shared/component/task-list-dialog/task-list-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { TaskDialogComponent } from '../../../shared/component/task-dialog/task-dialog.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AuthService } from '../../../auth/services/auth-service.service';

@Component({
  selector: 'app-task-list-overview',
  templateUrl: './task-list-overview.component.html',
  styleUrls: ['./task-list-overview.component.css']
})
export class TaskListOverviewComponent implements OnInit, OnDestroy {
   private destroy$ = new Subject<void>();
  private authService = inject(AuthService);

  taskLists: TaskList[] = [];
  tasks: Task[] = [];
  filteredTaskLists: TaskList[] = [];
  loading: boolean = false;

  searchTerm: string = '';
  colorFilter: string = 'all';
  taskCountFilter: string = 'all';
  sortBy: string = 'name';
  viewMode: 'grid' | 'list' = 'grid';

  displayedColumns: string[] = ['icon', 'name', 'description', 'totalTasks', 'completed', 'progress', 'created', 'actions'];

  colorOptions: string[] = [
    '#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2',
    '#303f9f', '#0097a7', '#689f38', '#fbc02d', '#e64a19',
    '#5d4037', '#455a64'
  ];

  constructor(
    private taskListService: TaskListService,
    private taskService: TaskService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadViewMode();
    this.loadData();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  private loadData(): void {
    this.loading = true;

    combineLatest([
      this.taskListService.taskLists$,
      this.taskService.tasks$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([taskLists, tasks]) => {
        this.taskLists = taskLists;
        this.tasks = tasks;
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
    const savedViewMode = localStorage.getItem('taskListViewMode') as 'grid' | 'list';
    if (savedViewMode && window.innerWidth > 1100) {
      this.viewMode = savedViewMode;
    } else {
      this.viewMode = 'grid';
      localStorage.setItem('taskListViewMode', 'grid');
    }
  }

  private checkScreenSize(): void {
    if (window.innerWidth <= 1100 && this.viewMode === 'list') {
      this.viewMode = 'grid';
      localStorage.setItem('taskListViewMode', 'grid');
    }
  }

  get isTableViewAvailable(): boolean {
    return window.innerWidth > 1100;
  }

  getIconColor(backgroundColor: string): string {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#333333' : '#ffffff';
  }

  applyFilters(): void {
    let filtered = [...this.taskLists];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(list =>
        list.name.toLowerCase().includes(term) ||
        (list.description && list.description.toLowerCase().includes(term))
      );
    }

    if (this.colorFilter !== 'all') {
      filtered = filtered.filter(list => list.color === this.colorFilter);
    }

    if (this.taskCountFilter !== 'all') {
      filtered = this.applyTaskCountFilter(filtered);
    }

    filtered = this.applySorting(filtered);

    this.filteredTaskLists = filtered;
  }

  private applyTaskCountFilter(lists: TaskList[]): TaskList[] {
    switch (this.taskCountFilter) {
      case 'empty':
        return lists.filter(list => this.getTaskCountForList(list._id) === 0);
      case 'with_tasks':
        return lists.filter(list => this.getTaskCountForList(list._id) > 0);
      case 'many_tasks':
        return lists.filter(list => this.getTaskCountForList(list._id) >= 5);
      default:
        return lists;
    }
  }

  private applySorting(lists: TaskList[]): TaskList[] {
    return lists.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'task_count':
          return this.getTaskCountForList(b._id) - this.getTaskCountForList(a._id);
        case 'recent_activity':
          return this.getLastActivityDate(b._id).getTime() - this.getLastActivityDate(a._id).getTime();
        default:
          return 0;
      }
    });
  }

  onViewModeChange(): void {
    localStorage.setItem('taskListViewMode', this.viewMode);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.colorFilter = 'all';
    this.taskCountFilter = 'all';
    this.sortBy = 'name';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' ||
           this.colorFilter !== 'all' ||
           this.taskCountFilter !== 'all';
  }

  openListDialog(taskList?: TaskList): void {
    const dialogRef = this.dialog.open(TaskListDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { taskList }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (taskList) {
          this.taskListService.updateTaskList(taskList._id, result).subscribe({
            next: () => {
              console.log('Lista actualizada correctamente');
            },
            error: (error) => {
              console.error('Error actualizando lista:', error);
            }
          });
        } else {
          this.taskListService.createTaskList(result).subscribe();
        }
      }
    });
  }

  navigateToList(list: TaskList): void {
    this.router.navigate(['/dashboard/tasks'], {
      queryParams: { listId: list._id }
    });
  }

  duplicateList(list: TaskList): void {
    const duplicatedList = {
      name: `${list.name} (copia)`,
      description: list.description,
      color: list.color,
      icon: list.icon
    };

    this.taskListService.createTaskList(duplicatedList).subscribe();
  }

  deleteList(list: TaskList): void {
    const taskCount = this.getTaskCountForList(list._id);
    let message = `¿Estás seguro de que quieres eliminar la lista "${list.name}"?`;

    if (taskCount > 0) {
      message += ` Esta lista contiene ${taskCount} tarea${taskCount !== 1 ? 's' : ''}.`;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskListService.deleteTaskList(list._id).subscribe();
      }
    });
  }

  createTaskInList(list: TaskList): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        taskLists: this.taskLists,
        selectedDate: new Date()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.listId = list._id;
        this.taskService.createTask(result).subscribe();
      }
    });
  }

  exportLists(): void {
    try {
      const user = this.authService.currentUser();
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text('Mis Listas de Tareas', 14, 22);

      doc.setFontSize(12);
      if (user) {
        doc.text(`Usuario: ${user.name}`, 14, 32);
        doc.text(`Email: ${user.email}`, 14, 40);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 48);
        doc.text(`Total de listas: ${this.filteredTaskLists.length}`, 14, 56);
      } else {
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 32);
        doc.text(`Total de listas: ${this.filteredTaskLists.length}`, 14, 40);
      }

      const tableData = this.filteredTaskLists.map(list => [
        list.name,
        list.description || 'Sin descripción',
        this.getTaskCountForList(list._id).toString(),
        this.getCompletedTasksForList(list._id).toString(),
        `${this.getProgressPercentage(list._id)}%`,
        this.formatDate(list.createdAt)
      ]);

      autoTable(doc, {
        head: [['Nombre', 'Descripción', 'Total Tareas', 'Completadas', 'Progreso', 'Fecha Creación']],
        body: tableData,
        startY: user ? 65 : 50,
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: 255
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 30 }
        }
      });

      const fileName = `mis-listas-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    }
  }

  getTaskCountForList(listId: string): number {
    return this.tasks.filter(task => task.listId === listId).length;
  }

  getCompletedTasksForList(listId: string): number {
    return this.tasks.filter(task => task.listId === listId && task.status === 'completed').length;
  }

  getProgressPercentage(listId: string): number {
    const total = this.getTaskCountForList(listId);
    if (total === 0) return 0;
    const completed = this.getCompletedTasksForList(listId);
    return Math.round((completed / total) * 100);
  }

  getProgressColor(listId: string): 'primary' | 'accent' | 'warn' {
    const percentage = this.getProgressPercentage(listId);
    if (percentage >= 80) return 'primary';
    if (percentage >= 50) return 'accent';
    return 'warn';
  }

  getTotalTasksCount(): number {
    return this.tasks.length;
  }

  getUniqueColorsCount(): number {
    const colors = new Set(this.taskLists.map(list => list.color));
    return colors.size;
  }

  getAverageTasksPerList(): number {
    if (this.taskLists.length === 0) return 0;
    return Math.round(this.getTotalTasksCount() / this.taskLists.length);
  }

  getColorName(color: string): string {
    const colorNames: { [key: string]: string } = {
      '#1976d2': 'Azul',
      '#388e3c': 'Verde',
      '#f57c00': 'Naranja',
      '#d32f2f': 'Rojo',
      '#7b1fa2': 'Púrpura',
      '#303f9f': 'Índigo',
      '#0097a7': 'Cian',
      '#689f38': 'Verde claro',
      '#fbc02d': 'Amarillo',
      '#e64a19': 'Naranja oscuro',
      '#5d4037': 'Marrón',
      '#455a64': 'Gris azulado'
    };
    return colorNames[color] || 'Personalizado';
  }

  getTaskCountFilterLabel(filter: string): string {
    const labels: { [key: string]: string } = {
      empty: 'Listas vacías',
      with_tasks: 'Con tareas',
      many_tasks: 'Muchas tareas'
    };
    return labels[filter] || filter;
  }

  private getLastActivityDate(listId: string): Date {
    const listTasks = this.tasks.filter(task => task.listId === listId);
    if (listTasks.length === 0) {
      const list = this.taskLists.find(l => l._id === listId);
      return list ? new Date(list.createdAt) : new Date(0);
    }

    const dates = listTasks.map(task =>
      task.completedAt ? new Date(task.completedAt) : new Date(task.updatedAt)
    );

    return new Date(Math.max(...dates.map(d => d.getTime())));
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  trackByListId(index: number, list: TaskList): string {
    return list._id;
  }
}
