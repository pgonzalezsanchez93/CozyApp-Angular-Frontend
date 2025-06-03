import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateTaskDto, UpdateTaskDto } from '../../dto';
import { TaskList } from '../../../task-lists/interfaces/task-list.interface';
import { Task } from '../../interfaces/task.interface';


@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() taskLists: TaskList[] = [];
  @Output() formSubmit = new EventEmitter<CreateTaskDto | UpdateTaskDto>();
  @Output() cancelForm = new EventEmitter<void>();

  taskForm!: FormGroup;
  isEditMode: boolean = false;
  formTitle: string = 'Nueva tarea';

  priorities = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();

    if (this.task) {
      this.isEditMode = true;
      this.formTitle = 'Editar tarea';
      this.populateForm();
    }
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [null],
      priority: ['medium'],
      listId: [''],
      allDay: [true],
      startTime: ['09:00'],
      endTime: ['17:00']
    });
  }

  populateForm(): void {
    if (!this.task) return;

    this.taskForm.patchValue({
      title: this.task.title,
      description: this.task.description || '',
      dueDate: this.task.dueDate ? new Date(this.task.dueDate) : null,
      priority: this.task.priority || 'medium',
      listId: this.task.listId || '',
      allDay: this.task.allDay !== undefined ? this.task.allDay : true,
      startTime: this.task.startTime || '09:00',
      endTime: this.task.endTime || '17:00'
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const formData = this.taskForm.value;

    if (formData.dueDate) {
      formData.dueDate = new Date(formData.dueDate);
    }

    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.cancelForm.emit();
  }
}