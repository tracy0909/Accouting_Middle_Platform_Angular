import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonthlyStmtPnlRoutingModule } from './monthly-stmt-pnl-routing.module';
import { MonthlyStmtPnlComponent } from './pages/monthly-stmt-pnl.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

@NgModule({
  declarations: [MonthlyStmtPnlComponent],
  imports: [
    CommonModule,
    SharedModule,
    MonthlyStmtPnlRoutingModule,
    IbpaasBaseComponentModule,
  ],
})
export class MonthlyStmtPnlModule {}
