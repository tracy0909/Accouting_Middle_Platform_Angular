import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { PnlAndFundsQueryRoutingModule } from './pnl-and-funds-query-routing.module';
import { PnlAndFundsQueryComponent } from './pages/pnl-and-funds-query.component';


@NgModule({
  declarations: [PnlAndFundsQueryComponent],
  imports: [
    CommonModule,
    PnlAndFundsQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class PnlAndFundsQueryModule { }
