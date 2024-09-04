import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { IntradayUnrealPnlQueryRoutingModule } from './intraday-unreal-pnl-query-routing.module';
import { IntradayUnrealPnlQueryComponent } from './pages/intraday-unreal-pnl-query/intraday-unreal-pnl-query.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

@NgModule({
  declarations: [IntradayUnrealPnlQueryComponent],
  imports: [
    CommonModule,
    IntradayUnrealPnlQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class IntradayUnrealPnlQueryModule {}
