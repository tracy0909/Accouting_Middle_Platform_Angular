import { TestBed } from '@angular/core/testing';

import { QuoteQueryService } from './quote-query.service';

describe('QuoteQueryService', () => {
  let service: QuoteQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuoteQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
