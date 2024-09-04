import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureListManagementComponent } from './pages/feature-list-management/feature-list-management.component';

const routes: Routes = [
  {
    path: '',
    component: FeatureListManagementComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeatureListManagementRoutingModule {}
