import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { LendUnrealdnMarketvalueRoutingModule } from './lend-unrealdn-marketvalue-routing.module';
import { LendUnrealdnMarketvalueComponent } from './pages/lend-unrealdn-marketvalue/lend-unrealdn-marketvalue.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [LendUnrealdnMarketvalueComponent],
  imports: [
    CommonModule,
    LendUnrealdnMarketvalueRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class LendUnrealdnMarketvalueModule {}
