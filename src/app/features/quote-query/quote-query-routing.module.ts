import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteQueryComponent } from './pages/quote-query.component';

const routes: Routes = [
  {
    path: '',
    component: QuoteQueryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuoteQueryRoutingModule { }
