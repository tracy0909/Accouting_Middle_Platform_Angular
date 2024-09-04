import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradePnlQueryComponent } from './pages/trade-pnl-query/trade-pnl-query.component';

const routes: Routes = [
  {
    path: '',
    component: TradePnlQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TradePnlQueryRoutingModule {}
