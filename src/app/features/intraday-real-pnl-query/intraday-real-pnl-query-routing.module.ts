import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntradayRealPnlQueryComponent } from './pages/intraday-real-pnl-query.component';

const routes: Routes = [{
  path: '',
  component: IntradayRealPnlQueryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IntradayRealPnlQueryRoutingModule { }
