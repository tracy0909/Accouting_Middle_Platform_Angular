import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { TransferMonitorRoutingModule } from './transfer-monitor-routing.module';
import { TransferMonitorComponent } from './pages/transfer-monitor/transfer-monitor.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [TransferMonitorComponent],
  imports: [
    CommonModule,
    TransferMonitorRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class TransferMonitorModule {}
