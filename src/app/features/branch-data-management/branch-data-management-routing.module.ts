import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchDataManagementComponent } from './pages/branch-data-management.component';

const routes: Routes = [
  {
    path: '',
    component: BranchDataManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BranchDataManagementRoutingModule { }
