import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntradayUnrealPnlQueryComponent } from './intraday-unreal-pnl-query.component';

describe('IntradayUnrealPnlQueryComponent', () => {
  let component: IntradayUnrealPnlQueryComponent;
  let fixture: ComponentFixture<IntradayUnrealPnlQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntradayUnrealPnlQueryComponent]
    });
    fixture = TestBed.createComponent(IntradayUnrealPnlQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
