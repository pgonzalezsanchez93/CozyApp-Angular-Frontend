import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListDetailComponent } from './components/task-list-detail/task-list-detail.component';
import { TaskListOverviewComponent } from './components/task-list-overview/task-list-overview.component';

export const routes: Routes = [
  { path: '', component: TaskListOverviewComponent },
  { path: ':id', component: TaskListDetailComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TaskListsRoutingModule { }
