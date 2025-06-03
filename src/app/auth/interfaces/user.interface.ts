export interface User {
  _id: string;
  email: string;
  name: string;
  password?: string;
  isActive: boolean;
  roles: string[];
  lastLogin: Date;
  preferences: UserPreferences;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferences {
  theme?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  avatarColor?: string;
  bio?: string;
  location?: string;
  website?: string;
  taskStats?: TaskStats;
  pomodoroSettings?: PomodoroSettings;
}

export interface TaskStats {
  completed: number;
  pending: number;
  lists: number;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak?: number;
  autoStartBreaks?: boolean;
  autoStartPomodoros?: boolean;
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
}
