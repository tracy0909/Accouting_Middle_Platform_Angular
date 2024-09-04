import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionAnnouncementInquiryComponent } from './pages/subscription-announcement-inquiry/subscription-announcement-inquiry.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionAnnouncementInquiryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionAnnouncementInquiryRoutingModule { }
