import { AuthService } from '../../services/auth-service.service';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {
 loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.patternValidator(),
        this.specialCharValidator()
      ]]
    });
  }

  patternValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const hasUpperCase = /[A-Z]/.test(control.value);
      const hasLowerCase = /[a-z]/.test(control.value);
      const hasNumber = /\d/.test(control.value);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return { pattern: true };
      }

      return null;
    };
  }

  specialCharValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(control.value);

      if (!hasSpecialChar) {
        return { specialChar: true };
      }

      return null;
    };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    console.log('Intentando login con:', { email, password: '[REDACTED]' });

    this.loginDirecto(email, password);
  }

  loginDirecto(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: (success) => {
        console.log('Login exitoso');

        Swal.fire({
          title: 'Login exitoso',
          text: '¡Bienvenido!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.isLoading = false;
          this.router.navigateByUrl('/dashboard');
        });
      },
      error: (errorMessage) => {
        console.error('Error en login:', errorMessage);
        this.isLoading = false;

        Swal.fire({
          title: 'Error de inicio de sesión',
          text: errorMessage || 'Credenciales inválidas o error de conexión.',
          icon: 'error',
          confirmButtonText: 'Intentar de nuevo'
        });
      }
    });
  }
}
