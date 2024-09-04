import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionAnnouncementInquiryRoutingModule } from './subscription-announcement-inquiry-routing.module';
import { SubscriptionAnnouncementInquiryComponent } from './pages/subscription-announcement-inquiry/subscription-announcement-inquiry.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from '../../shared/shared.module';
import { SubscriptionAnnouncementInquiryService } from './services/subscription-announcement-inquiry.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
@NgModule({
  declarations: [
    SubscriptionAnnouncementInquiryComponent
  ],
  imports: [
    CommonModule,
    SubscriptionAnnouncementInquiryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
  
})
export class SubscriptionAnnouncementInquiryModule { }
