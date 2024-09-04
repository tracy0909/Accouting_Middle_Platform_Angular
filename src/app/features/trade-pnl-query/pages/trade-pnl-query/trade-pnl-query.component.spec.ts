import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradePnlQueryComponent } from './trade-pnl-query.component';

describe('TradePnlQueryComponent', () => {
  let component: TradePnlQueryComponent;
  let fixture: ComponentFixture<TradePnlQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TradePnlQueryComponent]
    });
    fixture = TestBed.createComponent(TradePnlQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
