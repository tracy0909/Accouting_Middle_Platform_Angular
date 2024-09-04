import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { HistRealPnlQueryRoutingModule } from './hist-real-pnl-query-routing.module';
import { HistRealPnlQueryComponent } from './pages/hist-real-pnl-query.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

@NgModule({
  declarations: [HistRealPnlQueryComponent],
  imports: [
    CommonModule,
    HistRealPnlQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class HistRealPnlQueryModule {}
