import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../auth/services/auth-service.service';
import { UserService } from '../../../../services/user.service';
import { PomodoroService } from '../../../../pomodoro/services/pomodoro.service';
import { User, UserPreferences, PomodoroSettings } from '../../../../auth/interfaces';
import Swal from 'sweetalert2';
import { Theme, ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  user: User | null = null;
  isLoading = false;
  availableThemes: Theme[] = [];
  currentTheme: string = 'default';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadUserSettings();
    this.loadThemes();
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  loadThemes(): void {
    this.themeService.getAvailableThemes().subscribe(themes => {
      this.availableThemes = themes;
    });
  }

  loadUserSettings(): void {
    this.user = this.authService.currentUser();
    if (!this.user) {
      Swal.fire('Error', 'No se pudo cargar la información del usuario', 'error');
      return;
    }
    this.initForm();
  }

  initForm(): void {
    const preferences = this.user?.preferences || {};

    this.settingsForm = this.fb.group({
      theme: [preferences.theme || 'default']
    });
  }

  onThemeChange(themeId: string): void {
    this.themeService.setTheme(themeId);
    this.settingsForm.patchValue({ theme: themeId });
  }

  previewTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  saveSettings(): void {
    if (this.settingsForm.invalid || !this.user) return;

    this.isLoading = true;
    const formValue = this.settingsForm.value;

    const updatedPreferences: UserPreferences = {
      ...this.user.preferences,
      theme: formValue.theme
    };

    this.userService.updatePreferences(this.user._id, updatedPreferences).subscribe({
      next: (user) => {
        this.user = user;
        this.authService.updateCurrentUser(user);
        this.themeService.updateUserTheme(formValue.theme).subscribe();
        this.isLoading = false;
        Swal.fire('Éxito', 'Configuración guardada correctamente', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error guardando configuración:', error);
        Swal.fire('Error', 'Error al guardar la configuración', 'error');
      }
    });
  }

  getThemePreview(theme: Theme): string {
    return theme.primaryColor;
  }
}