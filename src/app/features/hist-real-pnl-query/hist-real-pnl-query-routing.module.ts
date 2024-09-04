import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistRealPnlQueryComponent } from './pages/hist-real-pnl-query.component';

const routes: Routes = [
  {
    path: '',
    component: HistRealPnlQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistRealPnlQueryRoutingModule {}
