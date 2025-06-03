import { NgModule } from '@angular/core';
import { CalendarComponent } from './calendar/calendar.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';



const routes: Routes = [
  { path: '', component: CalendarComponent }
];

@NgModule({
  declarations: [
    CalendarComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FullCalendarModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class CalendarModule { }
