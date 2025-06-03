import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, interval, of } from 'rxjs';
import { PomodoroMode, PomodoroSettings, PomodoroState, PomodoroStatus } from '../interfaces';
import { environment } from '../../../environments/environments';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PomodoroService {
  private baseUrl: string = `${environment.baseUrl}/api`;

  private defaultSettings: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true
  };

  private stateSubject = new BehaviorSubject<PomodoroState>({
    mode: PomodoroMode.WORK,
    status: PomodoroStatus.IDLE,
    timeRemaining: this.defaultSettings.workDuration * 60,
    completedPomodoros: 0,
    settings: this.defaultSettings
  });

  state$: Observable<PomodoroState> = this.stateSubject.asObservable();

  private timerSubscription?: Subscription;
  private timer$ = interval(1000);
  private notificationTimeout?: number;

  constructor(private http: HttpClient) {
    this.loadSettings();
  }

  getSettings(): Observable<PomodoroSettings> {
    return this.http.get<PomodoroSettings>(`${this.baseUrl}/pomodoro/settings`)
      .pipe(
        catchError(error => {
          console.error('Error loading settings from API', error);
          return of(this.defaultSettings);
        })
      );
  }

  updateSettings(settings: Partial<PomodoroSettings>): Observable<PomodoroSettings> {
    const currentSettings = this.stateSubject.value.settings;
    const updatedSettings = { ...currentSettings, ...settings };

    localStorage.setItem('pomodoroSettings', JSON.stringify(updatedSettings));

    return this.http.put<PomodoroSettings>(`${this.baseUrl}/pomodoro/settings`, updatedSettings)
      .pipe(
        catchError(error => {
          console.error('Error updating settings', error);
          return of(updatedSettings);
        })
      );
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.updateState({ settings });
        this.resetTimer(false);
      } catch (e) {
        console.error('Error parsing saved settings', e);
        this.getSettingsFromApi();
      }
    } else {
      this.getSettingsFromApi();
    }
  }

  private getSettingsFromApi(): void {
    this.http.get<PomodoroSettings>(`${this.baseUrl}/pomodoro/settings`)
      .subscribe({
        next: (settings) => {
          this.updateState({ settings });
          localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
          this.resetTimer(false);
        },
        error: (error) => {
          console.error('Error loading pomodoro settings', error);
          this.updateState({ settings: this.defaultSettings });
          this.resetTimer(false);
        }
      });
  }

  private updateState(partialState: Partial<PomodoroState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      ...partialState
    });
  }

  start(): void {
    this.clearNotificationTimeout();
    
    if (this.stateSubject.value.status === PomodoroStatus.IDLE ||
        this.stateSubject.value.status === PomodoroStatus.COMPLETED) {
      this.resetTimer(false);
    }

    this.updateState({ status: PomodoroStatus.RUNNING });

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = this.timer$.subscribe(() => {
      const currentState = this.stateSubject.value;

      if (currentState.timeRemaining <= 0) {
        this.completeTimer();
        return;
      }

      this.updateState({
        timeRemaining: currentState.timeRemaining - 1
      });
    });
  }

  pause(): void {
    this.clearNotificationTimeout();
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }

    this.updateState({ status: PomodoroStatus.PAUSED });
  }

  reset(): void {
    this.clearNotificationTimeout();
    this.resetTimer(true);
  }

  private resetTimer(resetStatus: boolean): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }

    const currentState = this.stateSubject.value;
    let timeRemaining = 0;

    switch (currentState.mode) {
      case PomodoroMode.WORK:
        timeRemaining = currentState.settings.workDuration * 60;
        break;
      case PomodoroMode.SHORT_BREAK:
        timeRemaining = currentState.settings.shortBreakDuration * 60;
        break;
      case PomodoroMode.LONG_BREAK:
        timeRemaining = currentState.settings.longBreakDuration * 60;
        break;
    }

    this.updateState({
      timeRemaining,
      status: resetStatus ? PomodoroStatus.IDLE : currentState.status
    });
  }

  private completeTimer(): void {
    this.clearNotificationTimeout();
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }

    const currentState = this.stateSubject.value;
    const previousMode = currentState.mode;
    let nextMode = currentState.mode;
    let completedPomodoros = currentState.completedPomodoros;

    if (currentState.mode === PomodoroMode.WORK) {
      completedPomodoros += 1;

      if (completedPomodoros % currentState.settings.sessionsUntilLongBreak === 0) {
        nextMode = PomodoroMode.LONG_BREAK;
      } else {
        nextMode = PomodoroMode.SHORT_BREAK;
      }

      this.saveCompletedSession(currentState.settings.workDuration * 60);
    } else {
      nextMode = PomodoroMode.WORK;
    }

    this.updateState({
      mode: nextMode,
      status: PomodoroStatus.COMPLETED,
      completedPomodoros
    });

    this.resetTimer(false);

    this.sendNotification(previousMode, nextMode);

    const shouldAutoStart = this.shouldAutoStart(previousMode, currentState.settings);
    if (shouldAutoStart) {
      this.notificationTimeout = window.setTimeout(() => this.start(), 3000);
    }
  }

  private shouldAutoStart(previousMode: PomodoroMode, settings: PomodoroSettings): boolean {
    if (previousMode === PomodoroMode.WORK) {
      return settings.autoStartBreaks || false;
    } else {
      return settings.autoStartPomodoros || false;
    }
  }

  private sendNotification(previousMode: PomodoroMode, nextMode: PomodoroMode): void {
    const currentSettings = this.stateSubject.value.settings;
    
    if (!currentSettings.notificationsEnabled || Notification.permission !== 'granted') {
      return;
    }

    let title: string;
    let message: string;

    if (previousMode === PomodoroMode.WORK) {
      if (nextMode === PomodoroMode.LONG_BREAK) {
        title = '¡Tiempo de descanso largo!';
        message = `¡Excelente trabajo! Has completado ${this.stateSubject.value.completedPomodoros} sesiones. Es hora de un descanso largo.`;
      } else {
        title = '¡Tiempo de descanso!';
        message = 'Has completado una sesión de trabajo. Es hora de tomar un descanso corto.';
      }
    } else {
      title = '¡Tiempo de volver al trabajo!';
      message = 'El descanso ha terminado. Es hora de concentrarse en el trabajo.';
    }

    const notification = new Notification(title, {
      body: message,
      tag: 'pomodoro-timer',
      requireInteraction: false,
      silent: !currentSettings.soundEnabled
    });

    setTimeout(() => {
      if (notification) {
        notification.close();
      }
    }, 5000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  setMode(mode: PomodoroMode): void {
    if (this.stateSubject.value.mode === mode) {
      return;
    }

    this.clearNotificationTimeout();
    this.updateState({ mode });
    this.resetTimer(true);
  }

  saveSettings(settings: Partial<PomodoroSettings>): void {
    const currentSettings = this.stateSubject.value.settings;
    const newSettings = { ...currentSettings, ...settings };

    this.updateState({ settings: newSettings });
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));

    this.http.put(`${this.baseUrl}/pomodoro/settings`, newSettings)
      .subscribe({
        error: (error) => console.error('Error saving pomodoro settings', error)
      });

    this.resetTimer(false);
  }

  private saveCompletedSession(duration: number): void {
    const session = {
      duration,
      mode: PomodoroMode.WORK,
      completed: true
    };

    this.http.post(`${this.baseUrl}/pomodoro/sessions`, session)
      .subscribe({
        error: (error) => console.error('Error saving pomodoro session', error)
      });
  }

  private clearNotificationTimeout(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = undefined;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  destroy(): void {
    this.clearNotificationTimeout();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}