import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { AdminGuard } from './guards/admin.guard';
import { UserDashboardGuard } from './guards/user-dashboard.guard';

const routes: Routes = [
 {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'tasks',
        loadChildren: () => import('./pages/tasks/tasks.module').then(m => m.TasksModule)
      },
      {
        path: 'lists',
        loadChildren: () => import('../task-lists/task-lists.module').then(m => m.TaskListsModule)
      },
      {
        path: 'calendar',
        loadChildren: () => import('./pages/calendar/calendar.module').then(m => m.CalendarModule)
      },
      {
        path: 'pomodoro',
        loadChildren: () => import('./pages/pomodoro/pomodoro.module').then(m => m.PomodoroModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
        canActivate: [AdminGuard]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
