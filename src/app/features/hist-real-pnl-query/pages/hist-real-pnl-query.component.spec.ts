import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistRealPnlQueryComponent } from './hist-real-pnl-query.component';

describe('HistRealPnlQueryComponent', () => {
  let component: HistRealPnlQueryComponent;
  let fixture: ComponentFixture<HistRealPnlQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistRealPnlQueryComponent]
    });
    fixture = TestBed.createComponent(HistRealPnlQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
