import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroSettingsComponent } from './components/pomodoro-settings/pomodoro-settings.component';
import { PomodoroTimerComponent } from './components/pomodoro-timer/pomodoro-timer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PomodoroRoutingModule } from './pomodoro-routing.module';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [
    PomodoroSettingsComponent,
    PomodoroTimerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    SharedModule,
    PomodoroRoutingModule
  ],
  exports: [
    PomodoroSettingsComponent,
    PomodoroTimerComponent
  ]
})
export class PomodoroModule { }
