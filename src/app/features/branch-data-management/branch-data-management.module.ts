import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BranchDataManagementRoutingModule } from './branch-data-management-routing.module';
import { BranchDataManagementComponent } from './pages/branch-data-management.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [BranchDataManagementComponent],
  imports: [
    CommonModule,
    BranchDataManagementRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class BranchDataManagementModule { }
