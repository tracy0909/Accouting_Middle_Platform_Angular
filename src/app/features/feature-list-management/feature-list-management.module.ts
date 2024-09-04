import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { FeatureListManagementRoutingModule } from './feature-list-management-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeatureListManagementComponent } from './pages/feature-list-management/feature-list-management.component';
import { FeatureListManagementDialogComponent } from './pages/feature-list-management-dialog/feature-list-management-dialog.component';

@NgModule({
  declarations: [
    FeatureListManagementComponent,
    FeatureListManagementDialogComponent,
  ],
  imports: [
    CommonModule,
    FeatureListManagementRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class FeatureListManagementModule {}
