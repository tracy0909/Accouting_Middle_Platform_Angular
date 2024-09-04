import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintRateSummaryQueryComponent } from './pages/maint-rate-summary-query/maint-rate-summary-query.component';

const routes: Routes = [
  {
    path: '',
    component: MaintRateSummaryQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaintRateSummaryQueryRoutingModule {}
