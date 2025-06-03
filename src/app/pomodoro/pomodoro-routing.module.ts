import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PomodoroTimerComponent } from './components/pomodoro-timer/pomodoro-timer.component';
import { PomodoroSettingsComponent } from './components/pomodoro-settings/pomodoro-settings.component';

const routes: Routes = [
  { path: '', component: PomodoroTimerComponent },
  { path: 'settings', component: PomodoroSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PomodoroRoutingModule { }
