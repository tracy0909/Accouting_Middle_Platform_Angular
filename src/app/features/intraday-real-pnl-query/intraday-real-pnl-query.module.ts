import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { IntradayRealPnlQueryRoutingModule } from './intraday-real-pnl-query-routing.module';
import { IntradayRealPnlQueryComponent } from './pages/intraday-real-pnl-query.component';


@NgModule({
  declarations: [IntradayRealPnlQueryComponent],
  imports: [
    CommonModule,
    IntradayRealPnlQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ]
})
export class IntradayRealPnlQueryModule { }
