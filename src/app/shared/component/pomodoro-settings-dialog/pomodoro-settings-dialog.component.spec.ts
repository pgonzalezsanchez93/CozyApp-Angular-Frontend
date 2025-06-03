import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PomodoroSettingsDialogComponent } from './pomodoro-settings-dialog.component';

describe('PomodoroSettingsDialogComponent', () => {
  let component: PomodoroSettingsDialogComponent;
  let fixture: ComponentFixture<PomodoroSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PomodoroSettingsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PomodoroSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
