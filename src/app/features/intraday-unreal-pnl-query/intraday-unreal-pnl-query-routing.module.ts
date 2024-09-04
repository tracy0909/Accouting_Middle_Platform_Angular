import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntradayUnrealPnlQueryComponent } from './pages/intraday-unreal-pnl-query/intraday-unreal-pnl-query.component';

const routes: Routes = [
  {
    path: '',
    component: IntradayUnrealPnlQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntradayUnrealPnlQueryRoutingModule {}
