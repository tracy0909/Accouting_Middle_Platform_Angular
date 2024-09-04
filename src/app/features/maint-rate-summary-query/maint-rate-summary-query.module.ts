import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { MaintRateSummaryQueryRoutingModule } from './maint-rate-summary-query-routing.module';
import { MaintRateSummaryQueryComponent } from './pages/maint-rate-summary-query/maint-rate-summary-query.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [MaintRateSummaryQueryComponent],
  imports: [
    CommonModule,
    MaintRateSummaryQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class MaintRateSummaryQueryModule {}
