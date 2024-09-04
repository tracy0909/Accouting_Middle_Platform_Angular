import { Component, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { BasicInformationComponent } from './basic-information/pages/basic-information.component';
import { FunctionSettingsComponent } from './function-settings/pages/function-settings.component';
import { UserSettingsComponent } from './user-settings/pages/user-settings.component';

@Component({
  selector: 'app-function-permission-group-maintenance',
  templateUrl: './function-permission-group-maintenance.component.html',
  styleUrls: ['./function-permission-group-maintenance.component.scss'],
})
export class FunctionPermissionGroupMaintenanceComponent {}
