import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealPnlQueryRoutingModule } from './real-pnl-query-routing.module';
import { RealPnlQueryComponent } from './pages/real-pnl-query.component';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { CostAdjustmentModule } from 'src/app/shared/components/cost-adjustment/cost-adjustment.module';

@NgModule({
  declarations: [RealPnlQueryComponent],
  imports: [
    CommonModule,
    RealPnlQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
    CostAdjustmentModule,
  ],
})
export class RealPnlQueryModule {}
