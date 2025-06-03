import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent implements OnInit {
 registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.patternValidator(),
        this.specialCharValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
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

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  };

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password })
      .subscribe({
        next: () => {
          Swal.fire('Registro exitoso', 'Redirigiendo al dashboard...', 'success');
          setTimeout(() => {
            this.router.navigateByUrl('/dashboard');
          }, 1000);
        },
        error: (message: string) => {
          this.isLoading = false;
          Swal.fire('Error', message || 'Error al registrarse', 'error');
        }
      });
  }
}
