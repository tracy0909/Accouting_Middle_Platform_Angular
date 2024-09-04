import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AfterMarketDatabaseCountRoutingModule } from './after-market-database-count-routing.module';
import { AfterMarketDatabaseCountComponent } from './pages/after-market-database-count/after-market-database-count.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [AfterMarketDatabaseCountComponent],
  imports: [
    CommonModule,
    AfterMarketDatabaseCountRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule,
  ],
})
export class AfterMarketDatabaseCountModule {}
