import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../../auth/interfaces';

interface DialogData {
  user?: User;
  isEditMode: boolean;
}

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.css']
})
export class UserFormDialogComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  isPasswordVisible = false;
  dialogTitle = 'Crear Nuevo Usuario';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data?.isEditMode || false;
  }

  ngOnInit(): void {
    this.initForm();

    if (this.isEditMode && this.data.user) {
      this.dialogTitle = 'Editar Usuario';
      this.populateForm();
    }
  }

  initForm(): void {
    const passwordValidators = this.isEditMode
      ? []
      : [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/)
        ];

    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      isAdmin: [false]
    });

    if (this.isEditMode) {
      this.userForm.get('email')?.disable();
    }
  }

  populateForm(): void {
    if (!this.data.user) return;

    this.userForm.patchValue({
      name: this.data.user.name,
      email: this.data.user.email,
      isAdmin: this.data.user.roles.includes('admin')
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formData = this.userForm.value;

    if (this.isEditMode) {
      const updateData = {
        name: formData.name,
        isAdmin: formData.isAdmin
      };
      this.dialogRef.close(updateData);
    } else {
      const createData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        isAdmin: formData.isAdmin
      };
      this.dialogRef.close(createData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
