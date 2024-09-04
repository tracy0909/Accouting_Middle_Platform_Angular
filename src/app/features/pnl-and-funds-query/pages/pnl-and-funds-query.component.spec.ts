import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnlAndFundsQueryComponent } from './pnl-and-funds-query.component';

describe('PnlAndFundsQueryComponent', () => {
  let component: PnlAndFundsQueryComponent;
  let fixture: ComponentFixture<PnlAndFundsQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PnlAndFundsQueryComponent]
    });
    fixture = TestBed.createComponent(PnlAndFundsQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
