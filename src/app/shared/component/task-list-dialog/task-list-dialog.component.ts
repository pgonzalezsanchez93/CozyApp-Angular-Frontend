import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskList } from '../../../task-lists/interfaces/task-list.interface';

export interface TaskListDialogData {
  taskList?: TaskList;
}

interface IconOption {
  label: string;
  value: string;
}

interface IconGroup {
  label: string;
  icons: IconOption[];
}

@Component({
  selector: 'app-task-list-dialog',
  templateUrl: './task-list-dialog.component.html',
  styleUrls: ['./task-list-dialog.component.css']
})
export class TaskListDialogComponent implements OnInit {
  listForm: FormGroup;
  isEditMode: boolean = false;
  saving: boolean = false;

  selectedColor: string = '#1976d2';
  selectedIcon: string = 'list';

  colorOptions: string[] = [
    '#1976d2',
    '#388e3c',
    '#f57c00',
    '#d32f2f',
    '#7b1fa2',
    '#303f9f',
    '#0097a7',
    '#689f38',
    '#fbc02d',
    '#e64a19',
    '#5d4037',
    '#455a64'
  ];

  iconGroups: IconGroup[] = [
    {
      label: 'General',
      icons: [
        { label: 'Lista', value: 'list' },
        { label: 'Tareas', value: 'assignment' },
        { label: 'Notas', value: 'note' },
        { label: 'Recordatorios', value: 'notifications' }
      ]
    },
    {
      label: 'Trabajo',
      icons: [
        { label: 'Trabajo', value: 'work' },
        { label: 'Oficina', value: 'business' },
        { label: 'Proyecto', value: 'architecture' },
        { label: 'Reunión', value: 'groups' },
        { label: 'Presentación', value: 'slideshow' }
      ]
    },
    {
      label: 'Personal',
      icons: [
        { label: 'Casa', value: 'home' },
        { label: 'Familia', value: 'people' },
        { label: 'Salud', value: 'favorite' },
        { label: 'Deporte', value: 'fitness_center' },
        { label: 'Comida', value: 'restaurant' }
      ]
    },
    {
      label: 'Actividades',
      icons: [
        { label: 'Compras', value: 'shopping_cart' },
        { label: 'Viajes', value: 'flight' },
        { label: 'Eventos', value: 'event' },
        { label: 'Libros', value: 'book' },
        { label: 'Música', value: 'music_note' },
        { label: 'Películas', value: 'movie' }
      ]
    },
    {
      label: 'Educación',
      icons: [
        { label: 'Estudios', value: 'school' },
        { label: 'Investigación', value: 'science' },
        { label: 'Idiomas', value: 'translate' },
        { label: 'Exámenes', value: 'quiz' }
      ]
    },
    {
      label: 'Finanzas',
      icons: [
        { label: 'Dinero', value: 'account_balance' },
        { label: 'Ahorros', value: 'savings' },
        { label: 'Inversiones', value: 'trending_up' },
        { label: 'Facturas', value: 'receipt' }
      ]
    },
    {
      label: 'Prioridades',
      icons: [
        { label: 'Importante', value: 'priority_high' },
        { label: 'Urgente', value: 'bolt' },
        { label: 'Favorito', value: 'star' },
        { label: 'Marcado', value: 'bookmark' }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskListDialogData
  ) {
    this.isEditMode = !!data.taskList?._id;
    this.listForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.taskList) {
      this.populateForm(this.data.taskList);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      color: [this.selectedColor],
      icon: [this.selectedIcon]
    });
  }

  private populateForm(taskList: TaskList): void {
    this.selectedColor = taskList.color || '#1976d2';
    this.selectedIcon = taskList.icon || 'list';

    this.listForm.patchValue({
      name: taskList.name,
      description: taskList.description || '',
      color: this.selectedColor,
      icon: this.selectedIcon
    });
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.listForm.patchValue({ color });
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.listForm.patchValue({ icon });
  }

  getIconLabel(iconValue: string): string {
    for (const group of this.iconGroups) {
      const icon = group.icons.find(i => i.value === iconValue);
      if (icon) {
        return icon.label;
      }
    }
    return 'Icono';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

onSave(): void {
    if (this.listForm.invalid) return;

    this.saving = true;
    const formValue = this.listForm.value;

    const listData = {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || '',
      color: this.selectedColor,
      icon: this.selectedIcon
    };

    this.dialogRef.close(listData);
    this.saving = false;
  }
}
