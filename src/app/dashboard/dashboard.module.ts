import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardSidenavComponent } from './components/dashboard-sidenav/dashboard-sidenav.component';
import { SharedModule } from '../shared/shared.module';
import { StatisticsWidgetComponent } from './components/widgets/statistics-widget/statistics-widget.component';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';
import { NgChartsModule } from 'ng2-charts';




@NgModule({
  declarations: [
    DashboardLayoutComponent,
    DashboardHeaderComponent,
    DashboardSidenavComponent,
    StatisticsWidgetComponent,
    UserFormDialogComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,

  ],
  exports: [
    DashboardLayoutComponent,
    StatisticsWidgetComponent,
    RouterModule
  ]
})
export class DashboardModule { }
