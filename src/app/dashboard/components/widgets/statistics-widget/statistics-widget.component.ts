import { Component, Input, OnInit } from '@angular/core';
import { Task } from '../../../../tasks/interfaces/task.interface';
import { TaskList } from '../../../../task-lists/interfaces/task-list.interface';

@Component({
  selector: 'app-statistics-widget',
  templateUrl: './statistics-widget.component.html',
  styleUrls: ['./statistics-widget.component.css']
})
export class StatisticsWidgetComponent implements OnInit {
  @Input() tasks: Task[] = [];
  @Input() taskLists: TaskList[] = [];
  @Input() timeframe: 'day' | 'week' | 'month' = 'week';
  @Input() chartType: 'line' | 'bar' | 'pie' = 'bar';
  

  chartData: any = {};
  chartOptions: any = {};
  

  completionRate: number = 0;
  tasksPerList: {name: string, count: number, color: string}[] = [];
  tasksByPriority: {priority: string, count: number}[] = [];

  startDate: Date = new Date();
  endDate: Date = new Date();
  
  constructor() {}

  ngOnInit(): void {
    this.calculateDateRange();
    this.calculateStatistics();
    this.prepareChartData();
  }
  
  calculateDateRange(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.endDate = new Date(today);
    
    switch(this.timeframe) {
      case 'day':
        this.startDate = today;
        break;
      case 'week':
        this.startDate = new Date(today);
        this.startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        this.startDate = new Date(today);
        this.startDate.setMonth(today.getMonth() - 1);
        break;
    }
  }
  
  calculateStatistics(): void {
    if (!this.tasks || this.tasks.length === 0) return;

    const filteredTasks = this.tasks.filter(task => {
      const taskDate = task.isCompleted && task.completedAt 
        ? new Date(task.completedAt) 
        : new Date(task.createdAt);
      
      return taskDate >= this.startDate && taskDate <= this.endDate;
    });
    
    if (filteredTasks.length === 0) return;

    const completedTasks = filteredTasks.filter(task => task.isCompleted);
    this.completionRate = (completedTasks.length / filteredTasks.length) * 100;

    this.calculateTasksPerList(filteredTasks);
    
    this.calculateTasksByPriority(filteredTasks);
  }
  
  calculateTasksPerList(tasks: Task[]): void {
    const listCounts: {[key: string]: number} = {};
    
    tasks.forEach(task => {
      const listId = task.listId || 'unlisted';
      listCounts[listId] = (listCounts[listId] || 0) + 1;
    });
    
    this.tasksPerList = Object.keys(listCounts).map(listId => {
      const list = this.taskLists.find(l => l._id === listId);
      return {
        name: list ? list.name : 'Sin lista',
        count: listCounts[listId],
        color: list ? list.color : '#CCCCCC'
      };
    });
   
    this.tasksPerList.sort((a, b) => b.count - a.count);
  }
  
  calculateTasksByPriority(tasks: Task[]): void {

    const priorityCounts: {[key: string]: number} = {
      'high': 0,
      'medium': 0,
      'low': 0,
      'none': 0
    };
    

    tasks.forEach(task => {
      const priority = task.priority || 'none';
      if (typeof priorityCounts[priority] === 'number') {
        priorityCounts[priority] += 1;
      } else {
        priorityCounts['none'] += 1;
      }
    });
    

    this.tasksByPriority = Object.keys(priorityCounts).map(priority => {
      return {
        priority: this.getPriorityLabel(priority),
        count: priorityCounts[priority]
      };
    });
  }
  
  getPriorityLabel(priority: string): string {
    switch(priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  }
  
  prepareChartData(): void {
    if (this.timeframe === 'day') {
      this.prepareHourlyChartData();
    } else {
      this.prepareDailyChartData();
    }
  }
  
  prepareHourlyChartData(): void {

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const completedPerHour = Array(24).fill(0);
    const createdPerHour = Array(24).fill(0);
    

    this.tasks.forEach(task => {
      if (task.isCompleted && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (this.isSameDay(completedDate, this.startDate)) {
          completedPerHour[completedDate.getHours()]++;
        }
      }
      
      const createdDate = new Date(task.createdAt);
      if (this.isSameDay(createdDate, this.startDate)) {
        createdPerHour[createdDate.getHours()]++;
      }
    });
    

    if (this.chartType === 'line' || this.chartType === 'bar') {
      this.chartData = {
        labels: hours.map(h => `${h}:00`),
        datasets: [
          {
            label: 'Tareas creadas',
            data: createdPerHour,
            backgroundColor: 'rgba(63, 81, 181, 0.5)',
            borderColor: 'rgba(63, 81, 181, 1)',
            borderWidth: 1
          },
          {
            label: 'Tareas completadas',
            data: completedPerHour,
            backgroundColor: 'rgba(76, 175, 80, 0.5)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1
          }
        ]
      };
    } else {

      this.chartData = {
        labels: ['Creadas', 'Completadas'],
        datasets: [{
          data: [
            createdPerHour.reduce((sum, val) => sum + val, 0),
            completedPerHour.reduce((sum, val) => sum + val, 0)
          ],
          backgroundColor: [
            'rgba(63, 81, 181, 0.7)',
            'rgba(76, 175, 80, 0.7)'
          ],
          borderColor: [
            'rgba(63, 81, 181, 1)',
            'rgba(76, 175, 80, 1)'
          ],
          borderWidth: 1
        }]
      };
    }
    

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };
  }
  
  prepareDailyChartData(): void {

    const dateLabels: string[] = [];
    const completedPerDay: number[] = [];
    const createdPerDay: number[] = [];
    
    let currentDate = new Date(this.startDate);
    while (currentDate <= this.endDate) {
      dateLabels.push(this.formatDate(currentDate));
      
     
      let completedCount = 0;
      let createdCount = 0;

      this.tasks.forEach(task => {
        if (task.isCompleted && task.completedAt) {
          const completedDate = new Date(task.completedAt);
          if (this.isSameDay(completedDate, currentDate)) {
            completedCount++;
          }
        }
        
        const createdDate = new Date(task.createdAt);
        if (this.isSameDay(createdDate, currentDate)) {
          createdCount++;
        }
      });
      
      completedPerDay.push(completedCount);
      createdPerDay.push(createdCount);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (this.chartType === 'line' || this.chartType === 'bar') {
      this.chartData = {
        labels: dateLabels,
        datasets: [
          {
            label: 'Tareas creadas',
            data: createdPerDay,
            backgroundColor: 'rgba(63, 81, 181, 0.5)',
            borderColor: 'rgba(63, 81, 181, 1)',
            borderWidth: 1
          },
          {
            label: 'Tareas completadas',
            data: completedPerDay,
            backgroundColor: 'rgba(76, 175, 80, 0.5)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1
          }
        ]
      };
    } else {

      this.chartData = {
        labels: ['Creadas', 'Completadas'],
        datasets: [{
          data: [
            createdPerDay.reduce((sum, val) => sum + val, 0),
            completedPerDay.reduce((sum, val) => sum + val, 0)
          ],
          backgroundColor: [
            'rgba(63, 81, 181, 0.7)',
            'rgba(76, 175, 80, 0.7)'
          ],
          borderColor: [
            'rgba(63, 81, 181, 1)',
            'rgba(76, 175, 80, 1)'
          ],
          borderWidth: 1
        }]
      };
    }

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
    
    if (this.chartType !== 'pie') {
      this.chartOptions.scales = {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      };
    }
  }
  
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  }
  
  changeTimeframe(timeframe: 'day' | 'week' | 'month'): void {
    this.timeframe = timeframe;
    this.calculateDateRange();
    this.calculateStatistics();
    this.prepareChartData();
  }
  
  changeChartType(chartType: 'line' | 'bar' | 'pie'): void {
    this.chartType = chartType;
    this.prepareChartData();
  }
  
 
  getCompletedTasksTotal(): number {
    if (!this.chartData?.datasets?.[1]?.data) {
      return 0;
    }
    return this.chartData.datasets[1].data.reduce((sum: number, val: number) => sum + val, 0);
  }

 
  getCreatedTasksTotal(): number {
    if (!this.chartData?.datasets?.[0]?.data) {
      return 0;
    }
    return this.chartData.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0);
  }
}