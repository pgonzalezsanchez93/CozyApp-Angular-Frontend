import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { PomodoroSettingsDialogComponent } from './component/pomodoro-settings-dialog/pomodoro-settings-dialog.component';
import { ConfirmDialogComponent } from './component/confirm-dialog/confirm-dialog.component';
import { TaskListDialogComponent } from './component/task-list-dialog/task-list-dialog.component';
import { TaskDialogComponent } from './component/task-dialog/task-dialog.component';
import { FormatDurationPipe } from './pipes/format-duration.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { FilterPipe } from './pipes/filter.pipe';


@NgModule({
  declarations: [
    ConfirmDialogComponent,
    TaskDialogComponent,
    TaskListDialogComponent,
    PomodoroSettingsDialogComponent,
    ClickOutsideDirective,
    FilterPipe,
    FormatDurationPipe,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    ConfirmDialogComponent,
    TaskDialogComponent,
    TaskListDialogComponent,
    PomodoroSettingsDialogComponent,
    ClickOutsideDirective,
    FilterPipe,
    FormatDurationPipe,
    SafeHtmlPipe
  ]
})
export class SharedModule { }
