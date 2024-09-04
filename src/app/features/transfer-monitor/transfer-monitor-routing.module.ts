import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransferMonitorComponent } from './pages/transfer-monitor/transfer-monitor.component';

const routes: Routes = [
  {
    path: '',
    component: TransferMonitorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferMonitorRoutingModule {}
