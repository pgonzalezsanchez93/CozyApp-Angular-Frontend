import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.css']
})
export class ResetPasswordPageComponent implements OnInit {
 resetForm!: FormGroup;
  token: string | null = null;
  isLoading = false;
  resetCompleted = false;
  showPassword = false;
  showConfirmPassword = false;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {

    this.token = this.route.snapshot.queryParamMap.get('token');
    
    console.log('🔑 Reset Password Component Init:', {
      token: this.token,
      queryParams: this.route.snapshot.queryParams,
      url: this.router.url
    });
    
    if (!this.token) {
      console.error('❌ No token provided');
      Swal.fire({
        title: 'Error',
        text: 'Token de restablecimiento no válido o expirado',
        icon: 'error',
        confirmButtonText: 'Ir al Login'
      }).then(() => {
        this.router.navigate(['/auth/login']);
      });
      return;
    }
    
    this.initForm();
  }
  
  private initForm(): void {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }
  
  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    console.log('🔍 Password validation:', {
      newPassword: newPassword ? '[PROVIDED]' : '[EMPTY]',
      confirmPassword: confirmPassword ? '[PROVIDED]' : '[EMPTY]',
      match: newPassword === confirmPassword
    });
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  onSubmit(): void {
    console.log('📝 Form submitted:', {
      formValid: this.resetForm.valid,
      formErrors: this.resetForm.errors,
      newPasswordErrors: this.resetForm.get('newPassword')?.errors,
      confirmPasswordErrors: this.resetForm.get('confirmPassword')?.errors
    });
    
    if (this.resetForm.invalid) {
      console.error('❌ Form is invalid');
      
   
      Object.keys(this.resetForm.controls).forEach(key => {
        const control = this.resetForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
          console.error(`❌ Field ${key} errors:`, control.errors);
        }
      });
      
      return;
    }
    
    if (!this.token) {
      console.error('❌ No token available');
      Swal.fire('Error', 'Token no disponible', 'error');
      return;
    }
    
    this.isLoading = true;
    const newPassword = this.resetForm.get('newPassword')?.value;
    
    console.log('🚀 Calling reset password API:', {
      token: this.token.substring(0, 10) + '...',
      passwordLength: newPassword?.length
    });
    
    this.userService.resetPassword(this.token, newPassword)
      .then((response) => {
        console.log('✅ Reset password success:', response);
        this.isLoading = false;
        this.resetCompleted = true;
        
        Swal.fire({
          title: '¡Éxito!',
          text: 'Tu contraseña ha sido restablecida correctamente',
          icon: 'success',
          confirmButtonText: 'Ir al Login'
        }).then(() => {
          this.router.navigate(['/auth/login']);
        });
      })
      .catch((error: any) => {
        console.error('❌ Reset password error:', error);
        this.isLoading = false;
        
        let errorMessage = 'Error al restablecer la contraseña';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        console.error('📝 Error details:', {
          error,
          message: errorMessage
        });
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Intentar de nuevo'
        });
      });
  }

  get newPasswordErrors() {
    const control = this.resetForm.get('newPassword');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'La contraseña es requerida';
      if (control.errors['minlength']) return 'La contraseña debe tener al menos 8 caracteres';
      if (control.errors['pattern']) return 'La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial';
    }
    return null;
  }
  
  get confirmPasswordErrors() {
    const control = this.resetForm.get('confirmPassword');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Confirma tu contraseña';
    }
    
    if (this.resetForm.errors?.['passwordMismatch'] && control?.touched) {
      return 'Las contraseñas no coinciden';
    }
    
    return null;
  }
}