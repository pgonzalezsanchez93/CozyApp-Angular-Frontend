import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalEventFormComponent } from './global-event-form.component';

describe('GlobalEventFormComponent', () => {
  let component: GlobalEventFormComponent;
  let fixture: ComponentFixture<GlobalEventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalEventFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlobalEventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
