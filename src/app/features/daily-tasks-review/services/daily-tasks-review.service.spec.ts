import { TestBed } from '@angular/core/testing';

import { DailyTasksReviewService } from './daily-tasks-review.service';

describe('DailyTasksReviewService', () => {
  let service: DailyTasksReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyTasksReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
