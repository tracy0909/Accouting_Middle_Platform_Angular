import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { QueryCnlendbackRoutingModule } from './query-cnlendback-routing.module';
import { QueryCnlendbackComponent } from './pages/query-cnlendback/query-cnlendback.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [QueryCnlendbackComponent],
  imports: [
    CommonModule,
    QueryCnlendbackRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class QueryCnlendbackModule {}
