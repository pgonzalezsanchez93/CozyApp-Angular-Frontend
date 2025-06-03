import { NgModule } from '@angular/core';
import { TasksComponent } from './tasks/tasks.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: TasksComponent
  },
  {
    path: ':id',
    component: TasksComponent,
    data: { taskDetail: true }
  }
];

@NgModule({
  declarations: [
    TasksComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes),

]
})
export class TasksModule { }
