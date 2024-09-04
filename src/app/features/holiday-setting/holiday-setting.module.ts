import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HolidaySettingRoutingModule } from './holiday-setting-routing.module';
import { HolidaySettingComponent } from './pages/holiday-setting.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [HolidaySettingComponent],
  imports: [
    CommonModule,
    HolidaySettingRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
    FormsModule,
  ],
})
export class HolidaySettingModule {}
