import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskListFormComponent } from './task-list-form.component';

describe('TaskListFormComponent', () => {
  let component: TaskListFormComponent;
  let fixture: ComponentFixture<TaskListFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskListFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
