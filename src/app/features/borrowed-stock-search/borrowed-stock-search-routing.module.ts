import { BorrowedStockSearchComponent } from './pages/borrowed-stock-search.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: BorrowedStockSearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BorrowedStockSearchRoutingModule { }
