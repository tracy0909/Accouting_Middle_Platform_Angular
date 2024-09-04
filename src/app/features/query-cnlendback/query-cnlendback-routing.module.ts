import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueryCnlendbackComponent } from './pages/query-cnlendback/query-cnlendback.component';

const routes: Routes = [
  {
    path: '',
    component: QueryCnlendbackComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QueryCnlendbackRoutingModule {}
