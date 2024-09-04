import { TestBed } from '@angular/core/testing';

import { UnrealPnlQueryService } from './unreal-pnl-query.service';

describe('UnrealPnlQueryService', () => {
  let service: UnrealPnlQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnrealPnlQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
