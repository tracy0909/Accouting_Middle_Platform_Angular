import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FunctionPermissionGroupMaintenanceComponent } from './pages/function-permission-group-maintenance.component';

const routes: Routes = [{
  path: '',
  component: FunctionPermissionGroupMaintenanceComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class FunctionPermissionGroupMaintenanceRoutingModule { }
