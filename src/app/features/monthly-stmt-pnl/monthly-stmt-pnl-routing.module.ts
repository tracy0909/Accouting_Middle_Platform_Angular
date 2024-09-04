import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonthlyStmtPnlComponent } from './pages/monthly-stmt-pnl.component';

const routes: Routes = [
  {
    path: '',
    component: MonthlyStmtPnlComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonthlyStmtPnlRoutingModule {}
