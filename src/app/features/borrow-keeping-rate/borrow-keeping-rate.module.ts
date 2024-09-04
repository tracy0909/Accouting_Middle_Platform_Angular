import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BorrowKeepingRateRoutingModule } from './borrow-keeping-rate-routing.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from '../../shared/shared.module';
import { BorrowKeepingRateComponent } from './pages/borrow-keeping-rate/borrow-keeping-rate.component';

@NgModule({
  declarations: [BorrowKeepingRateComponent],
  imports: [
    CommonModule,
    BorrowKeepingRateRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class BorrowKeepingRateModule {}
