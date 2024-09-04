import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DailyTasksReviewRoutingModule } from './daily-tasks-review-routing.module';
import { DailyTasksReviewComponent } from './pages/daily-tasks-review.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

@NgModule({
  declarations: [DailyTasksReviewComponent],
  imports: [
    CommonModule,
    DailyTasksReviewRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class DailyTasksReviewModule {}
