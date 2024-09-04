import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BidWinningQueryComponent } from './pages/bid-winning-query.component';

const routes: Routes = [
  {
    path: '',
    component: BidWinningQueryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BidWinningQueryRoutingModule { }
