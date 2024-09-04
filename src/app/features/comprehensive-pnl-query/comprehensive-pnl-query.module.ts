import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { ComprehensivePnlQueryRoutingModule } from './comprehensive-pnl-query-routing.module';
import { ComprehensivePnlQueryComponent } from './pages/comprehensive-pnl-query.component';


@NgModule({
  declarations: [ComprehensivePnlQueryComponent],
  imports: [
    CommonModule,
    ComprehensivePnlQueryRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
export class ComprehensivePnlQueryModule { }
