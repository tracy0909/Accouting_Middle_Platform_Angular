import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComprehensivePnlQueryComponent } from './pages/comprehensive-pnl-query.component';

const routes: Routes = [
  {
    path: '',
    component: ComprehensivePnlQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprehensivePnlQueryRoutingModule { }
