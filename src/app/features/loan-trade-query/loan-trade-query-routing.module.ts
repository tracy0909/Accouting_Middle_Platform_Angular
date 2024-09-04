import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoanTradeQueryComponent } from './pages/loan-trade-query.component';

const routes: Routes = [{
  path: '',
  component: LoanTradeQueryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoanTradeQueryRoutingModule { }
