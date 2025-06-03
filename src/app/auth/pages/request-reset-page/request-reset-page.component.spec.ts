import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestResetPageComponent } from './request-reset-page.component';

describe('RequestResetPageComponent', () => {
  let component: RequestResetPageComponent;
  let fixture: ComponentFixture<RequestResetPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestResetPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestResetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
