import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintRateSummaryQueryComponent } from './maint-rate-summary-query.component';

describe('MaintRateSummaryQueryComponent', () => {
  let component: MaintRateSummaryQueryComponent;
  let fixture: ComponentFixture<MaintRateSummaryQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaintRateSummaryQueryComponent]
    });
    fixture = TestBed.createComponent(MaintRateSummaryQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
