import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowedStockQueryComponent } from './borrowed-stock-query.component';

describe('BorrowedStockQueryComponent', () => {
  let component: BorrowedStockQueryComponent;
  let fixture: ComponentFixture<BorrowedStockQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BorrowedStockQueryComponent]
    });
    fixture = TestBed.createComponent(BorrowedStockQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
