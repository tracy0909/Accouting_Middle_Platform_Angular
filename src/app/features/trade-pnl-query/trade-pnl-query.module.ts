import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradePnlQueryRoutingModule } from './trade-pnl-query-routing.module';
import { TradePnlQueryComponent } from './pages/trade-pnl-query/trade-pnl-query.component';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
@NgModule({
  declarations: [TradePnlQueryComponent],
  imports: [
    CommonModule,
    TradePnlQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class TradePnlQueryModule {}
