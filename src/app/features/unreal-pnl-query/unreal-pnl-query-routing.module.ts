import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnrealPnlQueryComponent } from './pages/unreal-pnl-query.component';

const routes: Routes = [
  {
    path: '',
    component: UnrealPnlQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnrealPnlQueryRoutingModule {}
