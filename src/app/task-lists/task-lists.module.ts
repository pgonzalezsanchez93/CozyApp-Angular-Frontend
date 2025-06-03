import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListOverviewComponent } from './components/task-list-overview/task-list-overview.component';
import { TaskListFormComponent } from './components/task-list-form/task-list-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { TaskListsRoutingModule } from './task-lists-routing.module';
import { TaskListDetailComponent } from './components/task-list-detail/task-list-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    TaskListFormComponent,
    TaskListOverviewComponent,
    TaskListDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    SharedModule,
    TaskListsRoutingModule,
  ],
  exports: [
    TaskListOverviewComponent,
    TaskListFormComponent,
    TaskListDetailComponent

  ]
})
export class TaskListsModule { }
