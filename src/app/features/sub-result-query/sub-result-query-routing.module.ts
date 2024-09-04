import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubResultQueryComponent } from './pages/sub-result-query.component';

const routes: Routes = [{
  path: '',
  component: SubResultQueryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubResultQueryRoutingModule { }
