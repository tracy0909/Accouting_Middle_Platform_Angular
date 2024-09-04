import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntradayRealPnlQueryComponent } from './intraday-real-pnl-query.component';

describe('IntradayRealPnlQueryComponent', () => {
  let component: IntradayRealPnlQueryComponent;
  let fixture: ComponentFixture<IntradayRealPnlQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntradayRealPnlQueryComponent]
    });
    fixture = TestBed.createComponent(IntradayRealPnlQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
