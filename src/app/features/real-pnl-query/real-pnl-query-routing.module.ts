import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RealPnlQueryComponent } from './pages/real-pnl-query.component';

const routes: Routes = [
  {
    path: '',
    component: RealPnlQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RealPnlQueryRoutingModule {}
