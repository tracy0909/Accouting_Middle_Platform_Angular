import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntradayTransferMonitorComponent } from './pages/intraday-transfer-monitor.component';

const routes: Routes = [
  {
    path: '',
    component: IntradayTransferMonitorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IntradayTransferMonitorRoutingModule { }
