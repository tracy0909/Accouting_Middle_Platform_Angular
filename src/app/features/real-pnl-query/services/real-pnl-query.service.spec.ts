import { TestBed } from '@angular/core/testing';

import { RealPnlQueryService } from './real-pnl-query.service';

describe('RealPnlQueryService', () => {
  let service: RealPnlQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealPnlQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
