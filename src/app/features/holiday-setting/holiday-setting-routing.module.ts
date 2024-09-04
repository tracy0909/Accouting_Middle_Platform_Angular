import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HolidaySettingComponent } from './pages/holiday-setting.component';

const routes: Routes = [
  {
    path: '',
    component: HolidaySettingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HolidaySettingRoutingModule {}
