import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockLendingQueryComponent } from './pages/stock-lending-query.component';

const routes: Routes = [
  {
    path: '',
    component: StockLendingQueryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockLendingQueryRoutingModule { }
