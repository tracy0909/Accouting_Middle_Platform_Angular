import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CollateralValueQueryRoutingModule } from './collateral-value-query-routing.module';
import { CollateralValueQueryComponent } from './pages/collateral-value-query.component';


@NgModule({
  declarations: [CollateralValueQueryComponent],
  imports: [
    CommonModule,
    CollateralValueQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class CollateralValueQueryModule { }
