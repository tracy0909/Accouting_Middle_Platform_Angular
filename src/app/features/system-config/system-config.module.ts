import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemConfigRoutingModule } from './system-config-routing.module';
import { SystemConfigComponent } from './pages/system-config.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SystemConfigEditComponent } from './pages/system-config-edit/system-config-edit.component';


@NgModule({
  declarations: [SystemConfigComponent, SystemConfigEditComponent],
  imports: [
    CommonModule,
    SystemConfigRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class SystemConfigModule { }
