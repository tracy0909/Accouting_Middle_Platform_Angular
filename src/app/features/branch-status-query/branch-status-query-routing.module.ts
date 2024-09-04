import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchStatusQueryComponent } from './pages/branch-status-query/branch-status-query.component';

const routes: Routes = [
  {
    path: '',
    component: BranchStatusQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchStatusQueryRoutingModule {}
