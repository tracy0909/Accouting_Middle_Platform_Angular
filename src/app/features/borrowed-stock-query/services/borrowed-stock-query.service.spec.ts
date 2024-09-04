import { TestBed } from '@angular/core/testing';

import { BorrowedStockQueryService } from './borrowed-stock-query.service';

describe('BorrowedStockQueryService', () => {
  let service: BorrowedStockQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BorrowedStockQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
