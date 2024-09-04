import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnrealPnlQueryRoutingModule } from './unreal-pnl-query-routing.module';
import { UnrealPnlQueryComponent } from './pages/unreal-pnl-query.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { CostAdjustmentModule } from 'src/app/shared/components/cost-adjustment/cost-adjustment.module';

@NgModule({
  declarations: [UnrealPnlQueryComponent],
  imports: [
    CommonModule,
    UnrealPnlQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
    CostAdjustmentModule,
  ],
})
export class UnrealPnlQueryModule {}
