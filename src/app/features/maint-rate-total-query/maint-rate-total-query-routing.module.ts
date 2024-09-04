import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintRateTotalQueryComponent } from './pages/maint-rate-total-query.component';

const routes: Routes = [{
  path: '',
  component: MaintRateTotalQueryComponent
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintRateTotalQueryRoutingModule { }
