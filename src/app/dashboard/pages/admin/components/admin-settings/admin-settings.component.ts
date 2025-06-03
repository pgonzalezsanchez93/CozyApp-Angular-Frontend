import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  loading: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      appName: ['CozyApp', [Validators.required]],
      allowRegistration: [true],
      maintenanceMode: [false],
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(1440)]],
      passwordMinLength: [6, [Validators.required, Validators.min(4), Validators.max(20)]]
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) return;

    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      Swal.fire('Éxito', 'Configuración guardada correctamente', 'success');
    }, 1000);
  }

  resetSettings(): void {
    Swal.fire({
      title: '¿Restablecer configuración?',
      text: 'Esto restaurará todos los valores por defecto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.initForm();
        Swal.fire('Éxito', 'Configuración restablecida', 'success');
      }
    });
  }


  getCurrentDate(): Date {
    return new Date();
  }


  get currentDate(): Date {
    return new Date();
  }
}
