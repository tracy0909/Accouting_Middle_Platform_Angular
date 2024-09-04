import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyTasksReviewComponent } from './daily-tasks-review.component';

describe('DailyTasksReviewComponent', () => {
  let component: DailyTasksReviewComponent;
  let fixture: ComponentFixture<DailyTasksReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DailyTasksReviewComponent]
    });
    fixture = TestBed.createComponent(DailyTasksReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
