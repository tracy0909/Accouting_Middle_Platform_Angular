import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnrealPnlTotalQueryRoutingModule } from './unreal-pnl-total-query-routing.module';
import { UnrealPnlTotalQueryComponent } from './pages/unreal-pnl-total-query/unreal-pnl-total-query.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

@NgModule({
  declarations: [UnrealPnlTotalQueryComponent],
  imports: [
    CommonModule,
    UnrealPnlTotalQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class UnrealPnlTotalQueryModule {}
