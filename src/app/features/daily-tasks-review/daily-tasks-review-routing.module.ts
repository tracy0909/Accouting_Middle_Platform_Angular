import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyTasksReviewComponent } from './pages/daily-tasks-review.component';

const routes: Routes = [
  {
    path: '',
    component: DailyTasksReviewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailyTasksReviewRoutingModule {}
