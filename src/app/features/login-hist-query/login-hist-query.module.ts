import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';

import { LoginHistQueryRoutingModule } from './login-hist-query-routing.module';
import { LoginHistQueryComponent } from './pages/login-hist-query.component';


@NgModule({
  declarations: [LoginHistQueryComponent],
  imports: [
    CommonModule,
    LoginHistQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class LoginHistQueryModule { }
