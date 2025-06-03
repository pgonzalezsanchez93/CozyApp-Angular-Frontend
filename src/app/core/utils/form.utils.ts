import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchingFieldsValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors['matching']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ matching: true });
      return { matching: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}

export function dateRangeValidator(startDateControlName: string, endDateControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startDateControl = formGroup.get(startDateControlName);
    const endDateControl = formGroup.get(endDateControlName);

    if (!startDateControl || !endDateControl) {
      return null;
    }

    if (endDateControl.errors && !endDateControl.errors['dateRange']) {
      return null;
    }

    const startDate = startDateControl.value ? new Date(startDateControl.value) : null;
    const endDate = endDateControl.value ? new Date(endDateControl.value) : null;

    if (startDate && endDate && startDate > endDate) {
      endDateControl.setErrors({ dateRange: true });
      return { dateRange: true };
    } else {
      if (endDateControl.errors) {
        delete endDateControl.errors['dateRange'];
        if (Object.keys(endDateControl.errors).length === 0) {
          endDateControl.setErrors(null);
        }
      }
      return null;
    }
  };
}


export function trimFormValues(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);

    if (control instanceof FormGroup) {
      trimFormValues(control);
    } else if (control) {
      if (typeof control.value === 'string') {
        control.setValue(control.value.trim());
      }
    }
  });
}


export function markFormGroupTouched(formGroup: FormGroup): void {
  Object.values(formGroup.controls).forEach(control => {
    control.markAsTouched();

    if (control instanceof FormGroup) {
      markFormGroupTouched(control);
    }
  });
}


export function resetFormErrors(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);

    if (control instanceof FormGroup) {
      resetFormErrors(control);
    } else if (control) {
      control.setErrors(null);
    }
  });
}
