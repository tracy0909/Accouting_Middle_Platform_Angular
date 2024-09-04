import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { LoanTradeQueryRoutingModule } from './loan-trade-query-routing.module';
import { LoanTradeQueryComponent } from './pages/loan-trade-query.component';


@NgModule({
  declarations: [LoanTradeQueryComponent],
  imports: [
    CommonModule,
    LoanTradeQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class LoanTradeQueryModule { }
