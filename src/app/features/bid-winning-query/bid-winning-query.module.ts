import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BidWinningQueryRoutingModule } from './bid-winning-query-routing.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { BidWinningQueryComponent } from './pages/bid-winning-query.component';

@NgModule({
  declarations: [BidWinningQueryComponent],
  imports: [
    CommonModule,
    BidWinningQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class BidWinningQueryModule { }
