import { PomodoroMode, PomodoroStatus } from './pomodoro-enums';
import { PomodoroSettings } from './pomodoro-settings.interface';

export interface PomodoroState {
  mode: PomodoroMode;
  status: PomodoroStatus;
  timeRemaining: number;
  completedPomodoros: number;
  settings: PomodoroSettings;
}

