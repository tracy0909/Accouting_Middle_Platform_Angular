import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BorrowedStockQueryRoutingModule } from './borrowed-stock-query-routing.module';
import { BorrowedStockQueryComponent } from './pages/borrowed-stock-query.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

@NgModule({
  declarations: [BorrowedStockQueryComponent],
  imports: [
    CommonModule,
    BorrowedStockQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class BorrowedStockQueryModule {}
