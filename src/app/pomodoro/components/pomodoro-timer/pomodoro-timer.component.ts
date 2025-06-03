import { Component, OnDestroy, OnInit } from '@angular/core';
import { PomodoroMode, PomodoroState, PomodoroStatus } from '../../interfaces';
import { PomodoroSettingsDialogComponent } from '../../../shared/component/pomodoro-settings-dialog/pomodoro-settings-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PomodoroService } from '../../services/pomodoro.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pomodoro-timer',
  templateUrl: './pomodoro-timer.component.html',
  styleUrl: './pomodoro-timer.component.css'
})
export class PomodoroTimerComponent implements OnInit, OnDestroy {
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
    this.stateSubscription = this.pomodoroService.state$.subscribe(state => {
      this.pomodoroState = state;


      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }

      if (state.status === PomodoroStatus.COMPLETED) {
        this.notifyTimerComplete();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
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
      width: '400px',
      data: {
        workDuration: this.pomodoroState.settings.workDuration,
        shortBreakDuration: this.pomodoroState.settings.shortBreakDuration,
        longBreakDuration: this.pomodoroState.settings.longBreakDuration
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pomodoroService.saveSettings(result);
      }
    });
  }
  private notifyTimerComplete(): void {
    if (Notification.permission === 'granted') {

      const currentMode = this.pomodoroState.mode;

      let title: string;
      let message: string;

      if (currentMode === PomodoroMode.WORK) {
        title = '¡Tiempo de descanso!';
        message = 'Has completado un intervalo de trabajo. ¡Toma un descanso!';
      } else {
        title = '¡Tiempo de volver al trabajo!';
        message = 'El descanso ha terminado. ¡Es hora de volver al trabajo!';
      }

      const notification = new Notification(title, {
        body: message,
        icon: '/assets/images/pomodoro-icon.png'
      });

      setTimeout(() => notification.close(), 5000);
    }


    if (this.pomodoroState.settings.autoStartBreaks || this.pomodoroState.settings.autoStartPomodoros) {
      setTimeout(() => {
        this.startTimer();
      }, 3000);
    }
  }

}
