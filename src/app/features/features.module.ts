import { SharedModule } from 'primeng/api';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeaturesRoutingModule } from './features-routing.module';
import { IbpaasBaseComponentModule } from '../base/ibpaas-base-component.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class FeaturesModule {}
