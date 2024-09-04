import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BranchStatusQueryRoutingModule } from './branch-status-query-routing.module';
import { BranchStatusQueryComponent } from './pages/branch-status-query/branch-status-query.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [BranchStatusQueryComponent],
  imports: [
    CommonModule,
    BranchStatusQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class BranchStatusQueryModule {}
