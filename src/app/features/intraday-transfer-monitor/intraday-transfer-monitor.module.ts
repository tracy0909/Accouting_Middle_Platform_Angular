import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { IntradayTransferMonitorRoutingModule } from './intraday-transfer-monitor-routing.module';
import { IntradayTransferMonitorComponent } from './pages/intraday-transfer-monitor.component';


@NgModule({
  declarations: [IntradayTransferMonitorComponent],
  imports: [
    CommonModule,
    IntradayTransferMonitorRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ]
})
export class IntradayTransferMonitorModule { }
