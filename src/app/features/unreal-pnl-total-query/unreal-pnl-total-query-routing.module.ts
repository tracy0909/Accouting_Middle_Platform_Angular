import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnrealPnlTotalQueryComponent } from './pages/unreal-pnl-total-query/unreal-pnl-total-query.component';

const routes: Routes = [
  {
    path: '',
    component: UnrealPnlTotalQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnrealPnlTotalQueryRoutingModule {}
