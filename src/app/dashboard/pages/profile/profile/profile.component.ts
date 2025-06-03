import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth-service.service';
import { UserService } from '../../../../services/user.service';
import { User, UserPreferences } from '../../../../auth/interfaces';
import { UpdateProfileDto } from '../../../../auth/dto';
import { ConfirmDialogComponent } from '../../../../shared/component/confirm-dialog/confirm-dialog.component';
import Swal from 'sweetalert2';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

     profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading: boolean = false;
  user: User | null = null;
  showPasswordForm: boolean = false;

  themes = [
    { value: 'default', label: 'Predeterminado', color: '#3f51b5' },
    { value: 'dark', label: 'Oscuro', color: '#2c2c2c' },
    { value: 'light', label: 'Claro', color: '#f5f5f5' },
    { value: 'nature', label: 'Naturaleza', color: '#4caf50' },
    { value: 'ocean', label: 'Océano', color: '#03a9f4' }
  ];

  avatarOptions: string[] = [
    '#3f51b5', '#f44336', '#4caf50', '#ff9800', '#9c27b0',
    '#e91e63', '#2196f3', '#009688', '#ffeb3b', '#795548'
  ];

  selectedAvatarColor: string = '#3f51b5';
  selectedTheme: string = 'default';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private themeService: ThemeService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initForms();
  }

  loadUserData(): void {
    this.loading = true;
    this.user = this.authService.currentUser();

    if (this.user) {
      if (!this.user.preferences) {
        this.user.preferences = {};
      }

      if (!this.user.preferences.taskStats) {
        this.user.preferences.taskStats = {
          completed: 0,
          pending: 0,
          lists: 0
        };
      }

      this.selectedAvatarColor = this.user.preferences.avatarColor || this.getRandomColor();
      this.selectedTheme = this.user.preferences.theme || 'default';
      this.loading = false;
    } else {
      this.loading = false;
      Swal.fire('Error', 'Error al cargar datos del usuario', 'error');
    }
  }

  initForms(): void {
    const preferences = this.user?.preferences || {};

    this.profileForm = this.fb.group({
      name: [this.user?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [this.user?.email || ''],
      avatarColor: [this.selectedAvatarColor],
      theme: [this.selectedTheme],
      bio: [preferences.bio || ''],
      location: [preferences.location || ''],
      website: [preferences.website || '']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  selectAvatarColor(color: string): void {
    this.selectedAvatarColor = color;
    this.profileForm.get('avatarColor')?.setValue(color);
  }

  selectTheme(themeId: string): void {
    this.selectedTheme = themeId;
    this.profileForm.get('theme')?.setValue(themeId);
  }

  getRandomColor(): string {
    return this.avatarOptions[Math.floor(Math.random() * this.avatarOptions.length)];
  }

  getInitial(): string {
    return this.user?.name.charAt(0).toUpperCase() || 'U';
  }

  getCompletedTasks(): number {
    return this.user?.preferences?.taskStats?.completed || 0;
  }

  getPendingTasks(): number {
    return this.user?.preferences?.taskStats?.pending || 0;
  }

  getTaskLists(): number {
    return this.user?.preferences?.taskStats?.lists || 0;
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid || !this.user) return;

    this.loading = true;
    const formValue = this.profileForm.value;

    const updateProfileDto: UpdateProfileDto = {
      name: formValue.name
    };

    const userPreferences: UserPreferences = {
      ...(this.user.preferences || {}),
      avatarColor: formValue.avatarColor,
      theme: formValue.theme,
      bio: formValue.bio,
      location: formValue.location,
      website: formValue.website
    };

    this.userService.updateProfile(updateProfileDto).subscribe({
      next: (updatedUser) => {
        this.userService.updatePreferences(this.user!._id, userPreferences).subscribe({
          next: (finalUser) => {
            this.loading = false;
            this.user = finalUser;
            this.authService.updateCurrentUser(finalUser);

            if (formValue.theme !== this.selectedTheme) {
              this.themeService.setTheme(formValue.theme);
            }

            Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
          },
          error: (error) => {
            this.loading = false;
            Swal.fire('Error', error || 'Error al actualizar preferencias', 'error');
          }
        });
      },
      error: (error) => {
        this.loading = false;
        Swal.fire('Error', error || 'Error al actualizar perfil', 'error');
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: '¿Estás seguro de que deseas cambiar tu contraseña? Deberás iniciar sesión nuevamente.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const formValue = this.passwordForm.value;

        this.userService.changePassword(formValue.currentPassword, formValue.newPassword).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              title: 'Contraseña actualizada',
              text: 'Tu contraseña ha sido actualizada correctamente. Deberás iniciar sesión nuevamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            }).then(() => {
              this.authService.logout();
              this.router.navigateByUrl('/auth/login');
            });
          },
          error: (error) => {
            this.loading = false;
            Swal.fire('Error', error || 'Error al actualizar contraseña', 'error');
          }
        });
      }
    });
  }

  onDeleteAccount(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user) {
        this.loading = true;
        this.userService.deleteUser(this.user._id).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              title: 'Cuenta eliminada',
              text: 'Tu cuenta ha sido eliminada correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            }).then(() => {
              this.authService.logout();
              this.router.navigateByUrl('/auth/login');
            });
          },
          error: (error) => {
            this.loading = false;
            Swal.fire('Error', error || 'Error al eliminar cuenta', 'error');
          }
        });
      }
    });
  }
}
