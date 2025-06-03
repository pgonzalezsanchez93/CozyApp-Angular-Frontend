import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PomodoroSettingsComponent } from './pomodoro-settings.component';

describe('PomodoroSettingsComponent', () => {
  let component: PomodoroSettingsComponent;
  let fixture: ComponentFixture<PomodoroSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PomodoroSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PomodoroSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
