import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-request-reset-page',
  templateUrl: './request-reset-page.component.html',
  styleUrls: ['./request-reset-page.component.css']
})
export class RequestResetPageComponent {
 requestForm!: FormGroup;
  isLoading = false;
  requestSent = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  onSubmit(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    const email = this.requestForm.get('email')?.value;
    
    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.requestSent = true;
        
        Swal.fire({
          icon: 'success',
          title: 'Solicitud enviada',
          text: response.message,
          confirmButtonText: 'Entendido'
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.requestSent = true;
        
        Swal.fire({
          icon: 'info',
          title: 'Solicitud procesada',
          text: 'Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }
}