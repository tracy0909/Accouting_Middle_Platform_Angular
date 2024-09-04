import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuoteQueryRoutingModule } from './quote-query-routing.module';
import { QuoteQueryComponent } from './pages/quote-query.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    QuoteQueryComponent
  ],
  imports: [
    CommonModule,
    QuoteQueryRoutingModule,
    IbpaasBaseComponentModule,
    SharedModule
  ]
})
export class QuoteQueryModule { }
