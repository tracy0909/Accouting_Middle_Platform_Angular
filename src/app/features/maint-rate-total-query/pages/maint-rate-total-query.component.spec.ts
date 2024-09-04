import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintRateTotalQueryComponent } from './maint-rate-total-query.component';

describe('MaintRateTotalQueryComponent', () => {
  let component: MaintRateTotalQueryComponent;
  let fixture: ComponentFixture<MaintRateTotalQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaintRateTotalQueryComponent]
    });
    fixture = TestBed.createComponent(MaintRateTotalQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
