import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskList } from '../../interfaces/task-list.interface';


interface DialogData {
  taskList?: TaskList;
}

@Component({
  selector: 'app-task-list-form',
  templateUrl: './task-list-form.component.html',
  styleUrls: ['./task-list-form.component.css']
})
export class TaskListFormComponent implements OnInit {
  taskListForm!: FormGroup;
  isEditMode: boolean = false;
  dialogTitle: string = 'Crear lista de tareas';

  colorOptions: string[] = [
    '#3f51b5', '#673ab7', '#2196f3', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#9e9e9e', '#607d8b'
  ];

  iconOptions: {value: string, label: string}[] = [
    {value: 'list', label: 'Lista'},
    {value: 'home', label: 'Casa'},
    {value: 'work', label: 'Trabajo'},
    {value: 'school', label: 'Estudios'},
    {value: 'fitness_center', label: 'Ejercicio'},
    {value: 'shopping_cart', label: 'Compras'},
    {value: 'favorite', label: 'Favoritos'},
    {value: 'star', label: 'Importante'},
    {value: 'beach_access', label: 'Vacaciones'},
    {value: 'directions_run', label: 'Salud'},
    {value: 'book', label: 'Lectura'},
    {value: 'content_paste', label: 'Proyectos'},
    {value: 'attach_money', label: 'Finanzas'},
    {value: 'event', label: 'Eventos'}
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskListFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.data && this.data.taskList) {
      this.isEditMode = true;
      this.dialogTitle = 'Editar lista de tareas';
      this.populateForm();
    }
  }

  initForm(): void {
    this.taskListForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      color: ['#3f51b5'],
      icon: ['list']
    });
  }

  populateForm(): void {
    if (!this.data.taskList) return;

    this.taskListForm.patchValue({
      name: this.data.taskList.name,
      description: this.data.taskList.description || '',
      color: this.data.taskList.color || '#3f51b5',
      icon: this.data.taskList.icon || 'list'
    });
  }

  onSubmit(): void {
    if (this.taskListForm.invalid) return;

    this.dialogRef.close(this.taskListForm.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
