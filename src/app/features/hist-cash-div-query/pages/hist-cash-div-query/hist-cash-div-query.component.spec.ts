import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistCashDivQueryComponent } from './hist-cash-div-query.component';

describe('HistCashDivQueryComponent', () => {
  let component: HistCashDivQueryComponent;
  let fixture: ComponentFixture<HistCashDivQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistCashDivQueryComponent]
    });
    fixture = TestBed.createComponent(HistCashDivQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
