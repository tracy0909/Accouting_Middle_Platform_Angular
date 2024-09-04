import { TestBed } from '@angular/core/testing';

import { HistRealPnlQueryService } from './hist-real-pnl-query.service';

describe('HistRealPnlQueryService', () => {
  let service: HistRealPnlQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistRealPnlQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
