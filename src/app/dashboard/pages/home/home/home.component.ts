
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../auth/services/auth-service.service';
import { User } from '../../../../auth/interfaces';
import { Task } from '../../../../tasks/interfaces/task.interface';
import { TaskDialogComponent } from '../../../../shared/component/task-dialog/task-dialog.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { TaskService } from '../../../../tasks/services/task.service';
import { TaskListService } from '../../../../task-lists/services/task-list.service';
import { StatsService } from '../../../../services/stats.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TaskList } from '../../../../task-lists/interfaces/task-list.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();

  user: User | null = null;
  tasks: Task[] = [];
  taskLists: TaskList[] = [];
  todayTasks: Task[] = [];
  loading = true;

  stats = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalLists: 0,
    todayActiveTasks: 0,
    todayCompletedTasks: 0,
    todayCompletionRate: 0,
    completionRate: 0
  };

  quickLinks = [
    { title: 'Tareas', icon: 'task', route: '/dashboard/tasks' },
    { title: 'Ver calendario', icon: 'calendar_today', route: '/dashboard/calendar' },
    { title: 'Pomodoro', icon: 'timer', route: '/dashboard/pomodoro' },
    { title: 'Listas', icon: 'list_alt', route: '/dashboard/lists' }
  ];

  constructor(
    private taskService: TaskService,
    private taskListService: TaskListService,
    private authService: AuthService,
    private statsService: StatsService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    this.loadData();
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
        this.calculateStats();
        this.updateTodayTasks();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private calculateStats(): void {
    this.stats.totalTasks = this.tasks.length;
    this.stats.completedTasks = this.tasks.filter(task => task.isCompleted).length;
    this.stats.pendingTasks = this.tasks.filter(task => !task.isCompleted).length;
    this.stats.totalLists = this.taskLists.length;

    const todayActiveTasks = this.getTodayActiveTasks();
    this.stats.todayActiveTasks = todayActiveTasks.length;
    this.stats.todayCompletedTasks = todayActiveTasks.filter(task => task.isCompleted).length;
    this.stats.todayCompletionRate = this.stats.todayActiveTasks > 0
      ? Math.round((this.stats.todayCompletedTasks / this.stats.todayActiveTasks) * 100)
      : 0;

    this.stats.completionRate = this.stats.totalTasks > 0
      ? Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100)
      : 0;
  }

  private getTodayActiveTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return this.tasks.filter(task => {
      const startDate = task.dueDate ? new Date(task.dueDate) : null;
      const endDate = task.endDate ? new Date(task.endDate) : null;

      let startsToday = false;
      let endsToday = false;

      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
        startsToday = startDate.getTime() === today.getTime();
      }

      if (endDate) {
        endDate.setHours(0, 0, 0, 0);
        endsToday = endDate.getTime() === today.getTime();
      }

      return startsToday || endsToday;
    });
  }

  private updateTodayTasks(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.todayTasks = this.tasks.filter(task => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      return taskDate.getTime() >= today.getTime() && taskDate.getTime() < tomorrow.getTime();
    }).sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }

      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }

      return 0;
    });
  }

  onQuickLinkClick(link: any): void {
    if (link.action === 'create-task') {
      this.openCreateTaskDialog();
    } else {
      this.router.navigate([link.route]);
    }
  }

  openCreateTaskDialog(): void {
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
        this.taskService.createTask(result).subscribe();
      }
    });
  }

  toggleTaskCompletion(task: Task): void {
    const newStatus = task.isCompleted ? 'pending' : 'completed';
    this.taskService.updateTask(task._id, {
      status: newStatus,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date() : undefined
    }).subscribe();
  }

  getTaskListName(task: Task): string {
    if (!task.listId) return '';
    const list = this.taskLists.find(l => l._id === task.listId);
    return list?.name || '';
  }

  getTaskListColor(task: Task): string {
    if (!task.listId) return '#666';
    const list = this.taskLists.find(l => l._id === task.listId);
    return list?.color || '#666';
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.isCompleted) return false;
    return new Date(task.dueDate) < new Date();
  }

  trackByTaskId(index: number, task: Task): string {
    return task._id;
  }
}
