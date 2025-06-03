import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalEventsListComponent } from './global-events-list.component';

describe('GlobalEventsListComponent', () => {
  let component: GlobalEventsListComponent;
  let fixture: ComponentFixture<GlobalEventsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalEventsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlobalEventsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
