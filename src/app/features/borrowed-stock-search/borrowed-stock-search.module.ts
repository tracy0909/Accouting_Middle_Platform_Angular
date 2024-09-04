import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BorrowedStockSearchRoutingModule } from './borrowed-stock-search-routing.module';
import { BorrowedStockSearchComponent } from './pages/borrowed-stock-search.component';
import { IbpaasBaseComponentModule } from 'src/app/base/ibpaas-base-component.module';


@NgModule({
  declarations: [
    BorrowedStockSearchComponent,
  ],
  imports: [
    CommonModule,
    BorrowedStockSearchRoutingModule,
    SharedModule,
    IbpaasBaseComponentModule
  ]
})
// 導出元件
export class BorrowedStockSearchModule { }
