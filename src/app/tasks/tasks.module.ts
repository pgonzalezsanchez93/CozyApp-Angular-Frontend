import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    TaskListComponent,
    TaskDetailComponent,
    TaskFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: TaskListComponent
      },
      {
        path: ':id',
        component: TaskDetailComponent
      }
    ])
  ],
  exports: [
    TaskListComponent,
    TaskDetailComponent,
    TaskFormComponent
  ]
})
export class TasksModule { }
