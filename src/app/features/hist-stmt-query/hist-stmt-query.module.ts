import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { HistStmtQueryRoutingModule } from './hist-stmt-query-routing.module';
import { HistStmtQueryComponent } from './pages/hist-stmt-query.component';
import { TreeTableModule } from 'primeng/treetable';



@NgModule({
  declarations: [HistStmtQueryComponent],
  imports: [
    CommonModule,
    HistStmtQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
    TreeTableModule,
  ]
})
export class HistStmtQueryModule { }
