import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BorrowKeepingRateComponent } from './pages/borrow-keeping-rate/borrow-keeping-rate.component';

const routes: Routes = [
  {
    path: '',
    component: BorrowKeepingRateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BorrowKeepingRateRoutingModule {}
