import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { FunctionPermissionGroupMaintenanceRoutingModule } from './function-permission-group-maintenance-routing.module';
import { FunctionPermissionGroupMaintenanceComponent } from './pages/function-permission-group-maintenance.component';
import { UserSettingsComponent } from './pages/user-settings/pages/user-settings.component';
import { UserSettingsPickListComponent } from './pages/user-settings/pages/user-settings-pick-list/user-settings-pick-list.component';
import { BasicInformationComponent } from './pages/basic-information/pages/basic-information.component';
import { BasicInformationEditComponent } from './pages/basic-information/pages/basic-information-edit/basic-information-edit.component';
import { FunctionSettingsComponent } from './pages/function-settings/pages/function-settings.component';
import { FunctionSettingEditComponent } from './pages/function-settings/pages/function-setting-edit/function-setting-edit.component';

@NgModule({
  declarations: [
    FunctionPermissionGroupMaintenanceComponent,
    UserSettingsComponent,
    UserSettingsPickListComponent,
    BasicInformationComponent,
    BasicInformationEditComponent,
    FunctionSettingsComponent,
    FunctionSettingEditComponent,
  ],
  imports: [
    CommonModule,
    FunctionPermissionGroupMaintenanceRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class FunctionPermissionGroupMaintenanceModule {}
