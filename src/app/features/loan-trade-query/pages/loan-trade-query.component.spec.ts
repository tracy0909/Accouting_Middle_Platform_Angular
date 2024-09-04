import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTradeQueryComponent } from './loan-trade-query.component';

describe('LoanTradeQueryComponent', () => {
  let component: LoanTradeQueryComponent;
  let fixture: ComponentFixture<LoanTradeQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoanTradeQueryComponent]
    });
    fixture = TestBed.createComponent(LoanTradeQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
