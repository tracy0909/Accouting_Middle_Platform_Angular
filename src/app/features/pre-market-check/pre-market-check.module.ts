import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { PreMarketCheckRoutingModule } from './pre-market-check-routing.module';
import { PreMarketCheckComponent } from './pages/pre-market-check.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

@NgModule({
  declarations: [PreMarketCheckComponent],
  imports: [
    CommonModule,
    PreMarketCheckRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class PreMarketCheckModule {}
