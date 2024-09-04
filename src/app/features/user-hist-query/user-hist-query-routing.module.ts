import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserHistQueryComponent } from './pages/user-hist-query.component';

const routes: Routes = [
  {
    path: '',
    component: UserHistQueryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserHistQueryRoutingModule {}
