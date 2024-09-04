import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { HistCashDivQueryRoutingModule } from './hist-cash-div-query-routing.module';
import { HistCashDivQueryComponent } from './pages/hist-cash-div-query/hist-cash-div-query.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

@NgModule({
  declarations: [HistCashDivQueryComponent],
  imports: [
    CommonModule,
    HistCashDivQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class HistCashDivQueryModule {}
