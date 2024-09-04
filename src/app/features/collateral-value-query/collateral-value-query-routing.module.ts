import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollateralValueQueryComponent } from './pages/collateral-value-query.component';

const routes: Routes = [
  {
    path: '',
    component: CollateralValueQueryComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollateralValueQueryRoutingModule { }
