import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowKeepingRateComponent } from './borrow-keeping-rate.component';

describe('BorrowKeepingRateComponent', () => {
  let component: BorrowKeepingRateComponent;
  let fixture: ComponentFixture<BorrowKeepingRateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BorrowKeepingRateComponent]
    });
    fixture = TestBed.createComponent(BorrowKeepingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
