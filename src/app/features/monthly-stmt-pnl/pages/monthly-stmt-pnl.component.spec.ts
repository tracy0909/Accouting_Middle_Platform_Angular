import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyStmtPnlComponent } from './monthly-stmt-pnl.component';

describe('MonthlyStmtPnlComponent', () => {
  let component: MonthlyStmtPnlComponent;
  let fixture: ComponentFixture<MonthlyStmtPnlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyStmtPnlComponent]
    });
    fixture = TestBed.createComponent(MonthlyStmtPnlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
