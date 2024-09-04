import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LendUnrealdnMarketvalueComponent } from './pages/lend-unrealdn-marketvalue/lend-unrealdn-marketvalue.component';

const routes: Routes = [
  {
    path: '',
    component: LendUnrealdnMarketvalueComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LendUnrealdnMarketvalueRoutingModule {}
