import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreMarketCheckComponent } from './pages/pre-market-check.component';

const routes: Routes = [
  {
    path: '',
    component: PreMarketCheckComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreMarketCheckRoutingModule {}
