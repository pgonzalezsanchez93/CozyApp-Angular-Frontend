import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AdminComponent } from './components/admin/admin.component';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../../material/material.module';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminSettingsComponent } from './components/admin-settings/admin-settings.component';
import { AdminGlobalEventsComponent } from './components/admin-global-events/admin-global-events.component';
import { GlobalEventsModule } from '../../../global-events/global-events.module';

const routes: Routes = [
 {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'global-events', component: AdminGlobalEventsComponent },
      { path: 'settings', component: AdminSettingsComponent }
    ]
  }
];


@NgModule({
 declarations: [
    AdminComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    UserFormDialogComponent,
    AdminSettingsComponent,
    AdminGlobalEventsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    MaterialModule,
    SharedModule,
    GlobalEventsModule
  ],
  exports: [
    RouterModule
  ]
})
export class AdminModule { }
