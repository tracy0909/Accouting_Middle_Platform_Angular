import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistCashDivQueryComponent } from './pages/hist-cash-div-query/hist-cash-div-query.component';

const routes: Routes = [
  {
    path: '',
    component: HistCashDivQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistCashDivQueryRoutingModule {}
