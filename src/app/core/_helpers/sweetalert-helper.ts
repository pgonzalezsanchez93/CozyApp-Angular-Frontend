import Swal from 'sweetalert2';

export function showErrorMessage(message: string): void {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonText: 'Aceptar'
  });
}

export function showSuccessMessage(message: string, title: string = 'Éxito'): void {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonText: 'Aceptar'
  });
}

export function showWarningMessage(message: string, title: string = 'Advertencia'): void {
  Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonText: 'Aceptar'
  });
}

export function showInfoMessage(message: string, title: string = 'Información'): void {
  Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonText: 'Aceptar'
  });
}

export function showConfirmDialog(
  title: string,
  message: string,
  confirmText: string = 'Confirmar',
  cancelText: string = 'Cancelar'
): Promise<boolean> {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  }).then((result) => {
    return result.isConfirmed;
  });
}
