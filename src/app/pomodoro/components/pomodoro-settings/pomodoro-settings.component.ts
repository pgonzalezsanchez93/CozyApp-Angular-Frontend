import { Component, Inject, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { PomodoroSettings } from '../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PomodoroService } from '../../services/pomodoro.service';
import { PomodoroSettingsDialogComponent } from '../../../shared/component/pomodoro-settings-dialog/pomodoro-settings-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pomodoro-settings',
  templateUrl: './pomodoro-settings.component.html',
  styleUrls: ['./pomodoro-settings.component.css']
})
export class PomodoroSettingsComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PomodoroSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PomodoroSettings
  ) {
    this.settingsForm = this.createForm();
  }

  ngOnInit(): void {
    this.initForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      workDuration: [this.data.workDuration || 25, [Validators.required, Validators.min(1), Validators.max(60)]],
      shortBreakDuration: [this.data.shortBreakDuration || 5, [Validators.required, Validators.min(1), Validators.max(30)]],
      longBreakDuration: [this.data.longBreakDuration || 15, [Validators.required, Validators.min(1), Validators.max(120)]],
      sessionsUntilLongBreak: [this.data.sessionsUntilLongBreak || 4, [Validators.required, Validators.min(1), Validators.max(10)]],
      autoStartBreaks: [this.data.autoStartBreaks || false],
      autoStartPomodoros: [this.data.autoStartPomodoros || false],
      soundEnabled: [this.data.soundEnabled !== undefined ? this.data.soundEnabled : true],
      notificationsEnabled: [this.data.notificationsEnabled !== undefined ? this.data.notificationsEnabled : true]
    });
  }
  
  initForm(): void {
    this.settingsForm.patchValue({
      workDuration: this.data.workDuration || 25,
      shortBreakDuration: this.data.shortBreakDuration || 5,
      longBreakDuration: this.data.longBreakDuration || 15,
      sessionsUntilLongBreak: this.data.sessionsUntilLongBreak || 4,
      autoStartBreaks: this.data.autoStartBreaks || false,
      autoStartPomodoros: this.data.autoStartPomodoros || false,
      soundEnabled: this.data.soundEnabled !== undefined ? this.data.soundEnabled : true,
      notificationsEnabled: this.data.notificationsEnabled !== undefined ? this.data.notificationsEnabled : true
    });
  }
  
  onSave(): void {
    if (this.settingsForm.invalid) {
      Object.keys(this.settingsForm.controls).forEach(key => {
        const control = this.settingsForm.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }
    
    this.dialogRef.close(this.settingsForm.value);
  }

  resetToDefaults(): void {
    this.settingsForm.patchValue({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      soundEnabled: true,
      notificationsEnabled: true
    });
  }
  
  requestNotificationPermission(): void {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notificaciones permitidas');
          }
        });
      } else if (Notification.permission === 'denied') {
        alert('Las notificaciones están bloqueadas. Puedes habilitarlas en la configuración del navegador.');
      }
    } else {
      alert('Tu navegador no soporta notificaciones.');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}