import { LoginComponent } from './layout/components/login/login.component';
import { ErrorComponent } from './layout/components/error/error.component';
import { AccessDeniedComponent } from './layout/components/access-denied/access-denied.component';
import { NotFoundComponent } from './layout/components/not-found/not-found.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutMainComponent } from './layout/pages/layout-main/layout-main.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchDataManagementComponent } from './features/branch-data-management/pages/branch-data-management.component';
import { SubscriptionAnnouncementInquiryComponent } from './features/subscription-announcement-inquiry/pages/subscription-announcement-inquiry/subscription-announcement-inquiry.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutMainComponent,
    canActivate: [AuthGuard], // 要透過 AuthGuard 驗證過後才能進入
    children: [
      {
        path: '',
        loadChildren: () => import('./features/features.module').then((m) => m.FeaturesModule)
      },
      {
        path: 'branch-data-management',
        component: BranchDataManagementComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  {
    path: 'error',
    component: ErrorComponent
  },
  {
    path: '**', redirectTo: 'not-found', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {canceledNavigationResolution: 'computed'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
