import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowedStockSearchComponent } from './borrowed-stock-search.component';

describe('BorrowedStockSearchComponent', () => {
  let component: BorrowedStockSearchComponent;
  let fixture: ComponentFixture<BorrowedStockSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BorrowedStockSearchComponent]
    });
    fixture = TestBed.createComponent(BorrowedStockSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
