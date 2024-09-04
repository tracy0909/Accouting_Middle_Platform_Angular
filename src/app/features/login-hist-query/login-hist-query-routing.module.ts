import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginHistQueryComponent } from './pages/login-hist-query.component';

const routes: Routes = [{
  path: '',
  component: LoginHistQueryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginHistQueryRoutingModule { }
