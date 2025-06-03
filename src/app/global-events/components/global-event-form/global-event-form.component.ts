import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GlobalEvent } from '../../interfaces/global-event.interface';


interface DialogData {
  globalEvent?: GlobalEvent;
}

@Component({
  selector: 'app-global-event-form',
  templateUrl: './global-event-form.component.html',
  styleUrls: ['./global-event-form.component.css']
})
export class GlobalEventFormComponent implements OnInit {
   eventForm!: FormGroup;
  isEditMode: boolean = false;
  dialogTitle: string = 'Crear evento global';
  saving: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GlobalEventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.data && this.data.globalEvent) {
      this.isEditMode = true;
      this.dialogTitle = 'Editar evento global';
      this.populateForm();
    }
  }

  initForm(): void {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      startDate: [today, [Validators.required]],
      endDate: [tomorrow, [Validators.required]],
      allDay: [true],
      startTime: ['09:00'],
      endTime: ['17:00'],
      isActive: [true]
    }, { validators: this.dateRangeValidator });
  }

  populateForm(): void {
    if (!this.data.globalEvent) return;

    this.eventForm.patchValue({
      title: this.data.globalEvent.title,
      description: this.data.globalEvent.description || '',
      startDate: new Date(this.data.globalEvent.startDate),
      endDate: new Date(this.data.globalEvent.endDate),
      allDay: this.data.globalEvent.allDay !== false,
      startTime: this.data.globalEvent.startTime || '09:00',
      endTime: this.data.globalEvent.endTime || '17:00',
      isActive: this.data.globalEvent.isActive
    });
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (start && end && new Date(start) > new Date(end)) {
      return { 'dateRange': true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formValue = this.eventForm.value;

    const eventData: any = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || '',
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      allDay: formValue.allDay,
      isActive: formValue.isActive
    };

    if (!formValue.allDay) {
      eventData.startTime = formValue.startTime;
      eventData.endTime = formValue.endTime;
    }

    setTimeout(() => {
      this.saving = false;
      this.dialogRef.close(eventData);
    }, 500);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  calculateDuration(): number {
    const startDate = this.eventForm.get('startDate')?.value;
    const endDate = this.eventForm.get('endDate')?.value;

    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  get isAllDay(): boolean {
    return this.eventForm.get('allDay')?.value || false;
  }
}
