 import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { TaskDialogComponent } from '../../../../shared/component/task-dialog/task-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/component/confirm-dialog/confirm-dialog.component';
import Swal from 'sweetalert2';
import { Task } from '../../../../tasks/interfaces/task.interface';
import { TaskList } from '../../../../task-lists/interfaces/task-list.interface';
import { GlobalEvent } from '../../../../global-events/interfaces/global-event.interface';
import { TaskService } from '../../../../tasks/services/task.service';
import { TaskListService } from '../../../../task-lists/services/task-list.service';
import { GlobalEventService } from '../../../../global-events/services/global-event.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { GlobalEventDetailComponent } from '../../../../global-events/components/global-event-detail/global-event-detail.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private destroy$ = new Subject<void>();

  tasks: Task[] = [];
  taskLists: TaskList[] = [];
  globalEvents: GlobalEvent[] = [];
  calendarEvents: EventInput[] = [];
  todayTasks: Task[] = [];

  taskFilter: string = 'all';
  listFilter: string = 'all';
  priorityFilter: string = 'all';
  showLegend: boolean = false;
  showAllTodayTasks: boolean = false;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'dayGridMonth',
    locale: esLocale,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3,
    moreLinkClick: 'popover',
    weekends: true,
    height: 'auto',
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    eventDidMount: this.handleEventDidMount.bind(this),
    nowIndicator: true,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '18:00'
    },
    slotMinTime: '06:00:00',
    slotMaxTime: '24:00:00',
    allDaySlot: true,
    expandRows: true,
    events: []
  };

  constructor(
    private taskService: TaskService,
    private taskListService: TaskListService,
    private globalEventService: GlobalEventService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.updateTodayTasks();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateCalendarEvents();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    combineLatest([
      this.taskService.tasks$,
      this.taskListService.taskLists$,
      this.globalEventService.getActiveGlobalEvents()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([tasks, taskLists, globalEvents]) => {
        this.tasks = tasks;
        this.taskLists = taskLists;
        this.globalEvents = globalEvents;
        this.updateCalendarEvents();
        this.updateTodayTasks();
      },
      error: (error) => {
        console.error('Error loading calendar data:', error);
      }
    });
  }

  updateCalendarEvents(): void {
    this.calendarEvents = [
      ...this.getTaskEvents(),
      ...this.getGlobalEventEvents()
    ];

    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(this.calendarEvents);
      this.cdr.detectChanges();
    }
  }

  private getTaskEvents(): EventInput[] {
    let filteredTasks = [...this.tasks];

    if (this.taskFilter !== 'all') {
      if (this.taskFilter === 'pending') {
        filteredTasks = filteredTasks.filter(task => task.status !== 'completed');
      } else if (this.taskFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.status === 'completed');
      }
    }

    if (this.listFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.listId === this.listFilter);
    }

    if (this.priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === this.priorityFilter);
    }

    return filteredTasks
      .filter(task => task.dueDate)
      .map(task => this.taskToCalendarEvent(task));
  }

  private getGlobalEventEvents(): EventInput[] {
    return this.globalEvents.map(event => ({
      id: `global-${event._id}`,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      allDay: event.allDay !== false,
      backgroundColor: '#ff9800',
      borderColor: '#f57c00',
      textColor: '#fff',
      classNames: ['global-event'],
      extendedProps: {
        type: 'global-event',
        originalEvent: event
      }
    }));
  }

  private taskToCalendarEvent(task: Task): EventInput {
    const list = this.taskLists.find(l => l._id === task.listId);
    const isOverdue = this.isOverdue(task);

    let backgroundColor = list?.color || '#1976d2';
    let textColor = '#fff';

    if (task.status === 'completed') {
      backgroundColor = '#4caf50';
    } else if (isOverdue) {
      backgroundColor = '#f44336';
    }

    const event: EventInput = {
      id: `task-${task._id}`,
      title: task.title,
      allDay: task.allDay !== false,
      backgroundColor,
      borderColor: backgroundColor,
      textColor,
      classNames: [
        'task-event',
        `priority-${task.priority}`,
        `status-${task.status}`,
        isOverdue ? 'overdue' : ''
      ].filter(Boolean),
      extendedProps: {
        type: 'task',
        originalTask: task,
        priority: task.priority,
        status: task.status,
        listName: list?.name || ''
      }
    };

    if (task.allDay !== false || (!task.startTime && !task.endTime)) {
      event.start = task.dueDate;
      event.allDay = true;
    } else {
      const startDate = new Date(task.dueDate!);

      if (task.startTime) {
        const [hours, minutes] = task.startTime.split(':').map(Number);
        startDate.setHours(hours, minutes, 0, 0);
        event.start = startDate;
        event.allDay = false;
      }

      if (task.endTime && task.endDate) {
        const endDate = new Date(task.endDate);
        const [endHours, endMinutes] = task.endTime.split(':').map(Number);
        endDate.setHours(endHours, endMinutes, 0, 0);
        event.end = endDate;
      } else if (task.endTime) {
        const endDate = new Date(task.dueDate!);
        const [endHours, endMinutes] = task.endTime.split(':').map(Number);
        endDate.setHours(endHours, endMinutes, 0, 0);
        event.end = endDate;
      }
    }

    return event;
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
      return taskDate.getTime() === today.getTime();
    }).sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'completed') return 1;
        if (b.status === 'completed') return -1;
      }
      return a.startTime && b.startTime ?
        a.startTime.localeCompare(b.startTime) : 0;
    });
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const eventType = clickInfo.event.extendedProps['type'];

    if (eventType === 'task') {
      const task = clickInfo.event.extendedProps['originalTask'] as Task;
      this.editTask(task);
    } else if (eventType === 'global-event') {
      const globalEvent = clickInfo.event.extendedProps['originalEvent'] as GlobalEvent;
      console.log('Global event clicked:', globalEvent);
    }
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    this.openTaskDialog(selectInfo.start);
  }

  handleEventDrop(info: any): void {
    const eventType = info.event.extendedProps['type'];

    if (eventType === 'task') {
      const task = info.event.extendedProps['originalTask'] as Task;
      let newDate = info.event.start;

      const updateData: any = {
        dueDate: newDate
      };

      if (info.event.allDay) {
        updateData.allDay = true;
        updateData.startTime = null;
        updateData.endTime = null;
      } else {
        updateData.allDay = false;
        const hours = newDate.getHours();
        const minutes = newDate.getMinutes();
        updateData.startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      this.taskService.updateTask(task._id, updateData).subscribe({
        next: () => {
          console.log('Task date updated successfully');
        },
        error: (error) => {
          console.error('Error updating task date:', error);
          info.revert();
        }
      });
    }
  }

  handleEventResize(info: any): void {
    const eventType = info.event.extendedProps['type'];

    if (eventType === 'task') {
      const task = info.event.extendedProps['originalTask'] as Task;
      const endDate = info.event.end;

      if (endDate) {
        const updateData: any = {
          endDate: endDate
        };

        if (!info.event.allDay) {
          const hours = endDate.getHours();
          const minutes = endDate.getMinutes();
          updateData.endTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        this.taskService.updateTask(task._id, updateData).subscribe({
          next: () => {
            console.log('Task duration updated successfully');
          },
          error: (error) => {
            console.error('Error updating task duration:', error);
            info.revert();
          }
        });
      }
    }
  }

  handleEventDidMount(info: any): void {
    const eventType = info.event.extendedProps['type'];

    if (eventType === 'task') {
      const task = info.event.extendedProps['originalTask'] as Task;
      const priority = task.priority;

      if (priority === 'high') {
        info.el.style.fontWeight = 'bold';
        info.el.style.border = '2px solid #d32f2f';
      }

      if (task.status === 'completed') {
        info.el.style.textDecoration = 'line-through';
        info.el.style.opacity = '0.7';
      }
    }
  }

  changeView(view: string): void {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.changeView(view);
    }
  }

  goToToday(): void {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.today();
    }
  }

  toggleLegend(): void {
    this.showLegend = !this.showLegend;
  }

  openTaskDialog(selectedDate?: Date): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        taskLists: this.taskLists,
        selectedDate: selectedDate || new Date()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.createTask(result).subscribe();
      }
    });
  }

  editTask(task: Task): void {
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
        this.taskService.updateTask(task._id, result).subscribe();
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

  getTodayPendingCount(): number {
    return this.todayTasks.filter(task => task.status !== 'completed').length;
  }

  getTodayCompletedCount(): number {
    return this.todayTasks.filter(task => task.status === 'completed').length;
  }

  getTodayOverdueCount(): number {
    return this.todayTasks.filter(task => this.isOverdue(task)).length;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return labels[priority] || 'Media';
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  }

  trackByTaskId(index: number, task: Task): string {
    return task._id;
  }
}
