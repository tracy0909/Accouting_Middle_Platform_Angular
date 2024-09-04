import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfterMarketDatabaseCountComponent } from './pages/after-market-database-count/after-market-database-count.component';

const routes: Routes = [
  {
    path: '',
    component: AfterMarketDatabaseCountComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfterMarketDatabaseCountRoutingModule {}
