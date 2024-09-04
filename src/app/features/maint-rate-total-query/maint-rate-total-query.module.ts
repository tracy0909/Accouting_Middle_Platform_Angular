import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { MaintRateTotalQueryRoutingModule } from './maint-rate-total-query-routing.module';
import { MaintRateTotalQueryComponent } from './pages/maint-rate-total-query.component';


@NgModule({
  declarations: [MaintRateTotalQueryComponent],
  imports: [
    CommonModule,
    MaintRateTotalQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class MaintRateTotalQueryModule { }
