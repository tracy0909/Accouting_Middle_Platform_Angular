import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BorrowedStockQueryComponent } from './pages/borrowed-stock-query.component';

const routes: Routes = [
  {
    path: '',
    component: BorrowedStockQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BorrowedStockQueryRoutingModule {}
