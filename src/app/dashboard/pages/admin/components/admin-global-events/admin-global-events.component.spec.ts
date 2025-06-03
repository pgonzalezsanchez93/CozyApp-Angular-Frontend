import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGlobalEventsComponent } from './admin-global-events.component';

describe('AdminGlobalEventsComponent', () => {
  let component: AdminGlobalEventsComponent;
  let fixture: ComponentFixture<AdminGlobalEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminGlobalEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminGlobalEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
