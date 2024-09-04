import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistStmtQueryComponent } from './pages/hist-stmt-query.component';

const routes: Routes = [{
  path: '',
  component: HistStmtQueryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistStmtQueryRoutingModule { }
