import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { SubResultQueryRoutingModule } from './sub-result-query-routing.module';
import { SubResultQueryComponent } from './pages/sub-result-query.component';


@NgModule({
  declarations: [SubResultQueryComponent],
  imports: [
    CommonModule,
    SubResultQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class SubResultQueryModule { }
