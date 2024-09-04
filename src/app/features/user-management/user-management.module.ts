import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './pages/user-management.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { InfoComponent } from './pages/info/pages/info.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InfoEditComponent } from './pages/info/pages/info-edit/info-edit.component';
import { FunctionPermissionGroupSettingComponent } from './pages/function-permission-group-setting/pages/function-permission-group-setting/function-permission-group-setting.component';
import { FunctionPermissionGroupSettingDialogComponent } from './pages/function-permission-group-setting/pages/function-permission-group-setting-dialog/function-permission-group-setting-dialog.component';

@NgModule({
  declarations: [
    UserManagementComponent,
    InfoComponent,
    InfoEditComponent,
    FunctionPermissionGroupSettingComponent,
    FunctionPermissionGroupSettingDialogComponent,
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    IbpaasBaseComponentModule,
    SharedModule,
    RadioButtonModule,
  ],
})
export class UserManagementModule {}
