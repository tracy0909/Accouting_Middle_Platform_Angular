import { TestBed } from '@angular/core/testing';

import { MonthlyStmtPnlService } from './monthly-stmt-pnl.service';

describe('MonthlyStmtPnlService', () => {
  let service: MonthlyStmtPnlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlyStmtPnlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
