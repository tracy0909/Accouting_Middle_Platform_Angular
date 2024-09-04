import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntradayTransferMonitorComponent } from './intraday-transfer-monitor.component';

describe('IntradayTransferMonitorComponent', () => {
  let component: IntradayTransferMonitorComponent;
  let fixture: ComponentFixture<IntradayTransferMonitorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntradayTransferMonitorComponent]
    });
    fixture = TestBed.createComponent(IntradayTransferMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
