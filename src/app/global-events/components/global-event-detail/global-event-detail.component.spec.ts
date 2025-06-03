import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalEventDetailComponent } from './global-event-detail.component';

describe('GlobalEventDetailComponent', () => {
  let component: GlobalEventDetailComponent;
  let fixture: ComponentFixture<GlobalEventDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalEventDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlobalEventDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
