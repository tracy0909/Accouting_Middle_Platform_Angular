import { TestBed } from '@angular/core/testing';

import { UserHistQueryService } from './user-hist-query.service';

describe('UserHistQueryService', () => {
  let service: UserHistQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserHistQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
