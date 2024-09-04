import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockLendingQueryRoutingModule } from './stock-lending-query-routing.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StockLendingQueryComponent } from './pages/stock-lending-query.component';


@NgModule({
  declarations: [StockLendingQueryComponent],
  imports: [
    CommonModule,
    StockLendingQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class StockLendingQueryModule { }
