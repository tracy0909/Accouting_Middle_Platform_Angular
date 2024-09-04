import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockLendingQueryComponent } from './stock-lending-query.component';

describe('StockLendingQueryComponent', () => {
  let component: StockLendingQueryComponent;
  let fixture: ComponentFixture<StockLendingQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockLendingQueryComponent]
    });
    fixture = TestBed.createComponent(StockLendingQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
