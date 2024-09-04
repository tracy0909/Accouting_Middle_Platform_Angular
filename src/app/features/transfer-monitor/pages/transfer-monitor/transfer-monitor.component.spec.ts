import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferMonitorComponent } from './transfer-monitor.component';

describe('TransferMonitorComponent', () => {
  let component: TransferMonitorComponent;
  let fixture: ComponentFixture<TransferMonitorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransferMonitorComponent]
    });
    fixture = TestBed.createComponent(TransferMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
