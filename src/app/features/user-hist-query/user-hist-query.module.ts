import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { UserHistQueryRoutingModule } from './user-hist-query-routing.module';
import { UserHistQueryComponent } from './pages/user-hist-query.component';

@NgModule({
  declarations: [UserHistQueryComponent],
  imports: [
    CommonModule,
    UserHistQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class UserHistQueryModule {}
