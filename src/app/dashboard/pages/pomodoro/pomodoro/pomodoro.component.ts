import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PomodoroService } from '../../../../pomodoro/services/pomodoro.service';
import {
  PomodoroState,
  PomodoroMode,
  PomodoroStatus,
  PomodoroSettings
} from '../../../../pomodoro/interfaces';
import { Subscription } from 'rxjs';
import { PomodoroSettingsDialogComponent } from '../../../../shared/component/pomodoro-settings-dialog/pomodoro-settings-dialog.component';

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.css']
})
export class PomodoroComponent implements OnInit, OnDestroy {
  pomodoroState: PomodoroState = {
    mode: PomodoroMode.WORK,
    status: PomodoroStatus.IDLE,
    timeRemaining: 1500,
    completedPomodoros: 0,
    settings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      soundEnabled: true,
      notificationsEnabled: true
    }
  };

  private stateSubscription?: Subscription;
  autoContinue: boolean = false;

  constructor(
    private pomodoroService: PomodoroService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.requestNotificationPermission();
    
    this.stateSubscription = this.pomodoroService.state$.subscribe(state => {
      this.pomodoroState = state;
      this.autoContinue = state.settings.autoStartBreaks || state.settings.autoStartPomodoros;
    });
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.pomodoroService.destroy();
  }

  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  startTimer(): void {
    this.pomodoroService.start();
  }

  pauseTimer(): void {
    this.pomodoroService.pause();
  }

  resetTimer(): void {
    this.pomodoroService.reset();
  }

  changeMode(mode: string): void {
    switch (mode) {
      case 'work':
        this.pomodoroService.setMode(PomodoroMode.WORK);
        break;
      case 'shortBreak':
        this.pomodoroService.setMode(PomodoroMode.SHORT_BREAK);
        break;
      case 'longBreak':
        this.pomodoroService.setMode(PomodoroMode.LONG_BREAK);
        break;
    }
  }

  formatTime(seconds: number): string {
    return this.pomodoroService.formatTime(seconds);
  }

  openSettingsDialog(): void {
    const dialogRef = this.dialog.open(PomodoroSettingsDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        workDuration: this.pomodoroState.settings.workDuration,
        shortBreakDuration: this.pomodoroState.settings.shortBreakDuration,
        longBreakDuration: this.pomodoroState.settings.longBreakDuration,
        sessionsUntilLongBreak: this.pomodoroState.settings.sessionsUntilLongBreak,
        autoStartBreaks: this.pomodoroState.settings.autoStartBreaks,
        autoStartPomodoros: this.pomodoroState.settings.autoStartPomodoros,
        soundEnabled: this.pomodoroState.settings.soundEnabled,
        notificationsEnabled: this.pomodoroState.settings.notificationsEnabled
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pomodoroService.saveSettings(result);
      }
    });
  }

  getProgressPercentage(): number {
    const totalTime = this.getTotalTimeForCurrentMode();
    const remainingTime = this.pomodoroState.timeRemaining;
    const elapsedTime = totalTime - remainingTime;
    return Math.max(0, Math.min(100, (elapsedTime / totalTime) * 100));
  }

  getCycleProgressPercentage(): number {
    const totalCycles = this.pomodoroState.settings.sessionsUntilLongBreak;
    const completedCycles = this.pomodoroState.completedPomodoros % totalCycles;
    return (completedCycles / totalCycles) * 100;
  }

  getCycleProgressText(): string {
    const totalCycles = this.pomodoroState.settings.sessionsUntilLongBreak;
    const completedCycles = this.pomodoroState.completedPomodoros % totalCycles;
    return `${completedCycles}/${totalCycles}`;
  }

  private getTotalTimeForCurrentMode(): number {
    switch (this.pomodoroState.mode) {
      case PomodoroMode.WORK:
        return this.pomodoroState.settings.workDuration * 60;
      case PomodoroMode.SHORT_BREAK:
        return this.pomodoroState.settings.shortBreakDuration * 60;
      case PomodoroMode.LONG_BREAK:
        return this.pomodoroState.settings.longBreakDuration * 60;
      default:
        return 1500;
    }
  }
}