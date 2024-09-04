import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionAnnouncementInquiryComponent } from './subscription-announcement-inquiry.component';

describe('SubscriptionAnnouncementInquiryComponent', () => {
  let component: SubscriptionAnnouncementInquiryComponent;
  let fixture: ComponentFixture<SubscriptionAnnouncementInquiryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionAnnouncementInquiryComponent]
    });
    fixture = TestBed.createComponent(SubscriptionAnnouncementInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
