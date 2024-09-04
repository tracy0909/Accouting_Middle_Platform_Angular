import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealPnlQueryComponent } from './real-pnl-query.component';

describe('RealPnlQueryComponent', () => {
  let component: RealPnlQueryComponent;
  let fixture: ComponentFixture<RealPnlQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RealPnlQueryComponent]
    });
    fixture = TestBed.createComponent(RealPnlQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
