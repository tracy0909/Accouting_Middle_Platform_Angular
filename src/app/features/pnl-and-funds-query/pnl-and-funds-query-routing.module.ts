import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PnlAndFundsQueryComponent } from './pages/pnl-and-funds-query.component';

const routes: Routes = [{
  path: '',
  component: PnlAndFundsQueryComponent
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PnlAndFundsQueryRoutingModule { }
