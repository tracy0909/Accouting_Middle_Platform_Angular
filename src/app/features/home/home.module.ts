import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class HomeModule { }
