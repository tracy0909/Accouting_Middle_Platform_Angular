import { TestBed } from '@angular/core/testing';

import { PreMarketCheckService } from './pre-market-check.service';

describe('PreMarketCheckService', () => {
  let service: PreMarketCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreMarketCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
