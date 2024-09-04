import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'borrowed-stock-search',
    loadChildren: () =>
      import('./borrowed-stock-search/borrowed-stock-search.module').then(
        (m) => m.BorrowedStockSearchModule,
      ),
  },
  {
    path: 'system-config',
    loadChildren: () =>
      import('./system-config/system-config.module').then(
        (m) => m.SystemConfigModule,
      ),
  },
  {
    path: 'branch-data-management',
    loadChildren: () =>
      import('./branch-data-management/branch-data-management.module').then(
        (m) => m.BranchDataManagementModule,
      ),
  },
  {
    path: 'subscription-announcement-inquiry',
    loadChildren: () =>
      import(
        './subscription-announcement-inquiry/subscription-announcement-inquiry.module'
      ).then((m) => m.SubscriptionAnnouncementInquiryModule),
  },
  {
    path: 'quote-query',
    loadChildren: () =>
      import('./quote-query/quote-query.module').then(
        (m) => m.QuoteQueryModule,
      ),
  },
  {
    path: 'feature-list-management',
    loadChildren: () =>
      import('./feature-list-management/feature-list-management.module').then(
        (m) => m.FeatureListManagementModule,
      ),
  },
  {
    path: 'holiday-setting',
    loadChildren: () =>
      import('./holiday-setting/holiday-setting.module').then(
        (m) => m.HolidaySettingModule,
      ),
  },
  {
    path: 'hist-stmt-query',
    loadChildren: () =>
      import('./hist-stmt-query/hist-stmt-query.module').then(
        (m) => m.HistStmtQueryModule,
      ),
  },
  {
    path: 'user-management',
    loadChildren: () =>
      import('./user-management/user-management.module').then(
        (m) => m.UserManagementModule,
      ),
  },
  {
    path: 'function-permission-group-maintenance',
    loadChildren: () =>
      import(
        './function-permission-group-maintenance/function-permission-group-maintenance.module'
      ).then((m) => m.FunctionPermissionGroupMaintenanceModule),
  },
  {
    path: 'user-hist-query',
    loadChildren: () =>
      import('./user-hist-query/user-hist-query.module').then(
        (m) => m.UserHistQueryModule,
      ),
  },
  {
    path: 'login-hist-query',
    loadChildren: () =>
      import('./login-hist-query/login-hist-query.module').then(
        (m) => m.LoginHistQueryModule,
      ),
  },
  {
    path: 'query-cnlendback',
    loadChildren: () =>
      import('./query-cnlendback/query-cnlendback.module').then(
        (m) => m.QueryCnlendbackModule,
      ),
  },
  {
    path: 'bid-winning-query',
    loadChildren: () =>
      import('./bid-winning-query/bid-winning-query.module').then(
        (m) => m.BidWinningQueryModule,
      ),
  },
  {
    path: 'borrow-keeping-rate',
    loadChildren: () =>
      import('./borrow-keeping-rate/borrow-keeping-rate.module').then(
        (m) => m.BorrowKeepingRateModule,
      ),
  },
  {
    path: 'borrowed-stock-query',
    loadChildren: () =>
      import('./borrowed-stock-query/borrowed-stock-query.module').then(
        (m) => m.BorrowedStockQueryModule,
      ),
  },
  {
    path: 'lend-unrealdn-marketvalue',
    loadChildren: () =>
      import(
        './lend-unrealdn-marketvalue/lend-unrealdn-marketvalue.module'
      ).then((m) => m.LendUnrealdnMarketvalueModule),
  },
  {
    path: 'loan-trade-query',
    loadChildren: () =>
      import('./loan-trade-query/loan-trade-query.module').then(
        (m) => m.LoanTradeQueryModule,
      ),
  },
  {
    path: 'sub-result-query',
    loadChildren: () =>
      import('./sub-result-query/sub-result-query.module').then(
        (m) => m.SubResultQueryModule,
      ),
  },
  {
    path: 'maint-rate-total-query',
    loadChildren: () =>
      import('./maint-rate-total-query/maint-rate-total-query.module').then(
        (m) => m.MaintRateTotalQueryModule,
      ),
  },
  {
    path: 'stock-lending-query',
    loadChildren: () =>
      import('./stock-lending-query/stock-lending-query.module').then(
        (m) => m.StockLendingQueryModule,
      ),
  },
  {
    path: 'maint-rate-summary-query',
    loadChildren: () =>
      import('./maint-rate-summary-query/maint-rate-summary-query.module').then(
        (m) => m.MaintRateSummaryQueryModule,
      ),
  },
  {
    path: 'monthly-stmt-pnl',
    loadChildren: () =>
      import('./monthly-stmt-pnl/monthly-stmt-pnl.module').then(
        (m) => m.MonthlyStmtPnlModule,
      ),
  },
  {
    path: 'unreal-pnl-query',
    loadChildren: () =>
      import('./unreal-pnl-query/unreal-pnl-query.module').then(
        (m) => m.UnrealPnlQueryModule,
      ),
  },
  {
    path: 'hist-real-pnl-query',
    loadChildren: () =>
      import('./hist-real-pnl-query/hist-real-pnl-query.module').then(
        (m) => m.HistRealPnlQueryModule,
      ),
  },
  {
    path: 'collateral-value-query',
    loadChildren: () =>
      import('./collateral-value-query/collateral-value-query.module').then(
        (m) => m.CollateralValueQueryModule,
      ),
  },
  {
    path: 'pnl-and-funds-query',
    loadChildren: () =>
      import('./pnl-and-funds-query/pnl-and-funds-query.module').then(
        (m) => m.PnlAndFundsQueryModule,
      ),
  },
  {
    path: 'comprehensive-pnl-query',
    loadChildren: () =>
      import('./comprehensive-pnl-query/comprehensive-pnl-query.module').then(
        (m) => m.ComprehensivePnlQueryModule,
      ),
  },
  {
    path: 'trade-pnl-query',
    loadChildren: () =>
      import('./trade-pnl-query/trade-pnl-query.module').then(
        (m) => m.TradePnlQueryModule,
      ),
  },
  {
    path: 'unreal-pnl-total-query',
    loadChildren: () =>
      import('./unreal-pnl-total-query/unreal-pnl-total-query.module').then(
        (m) => m.UnrealPnlTotalQueryModule,
      ),
  },
  {
    path: 'real-pnl-query',
    loadChildren: () =>
      import('./real-pnl-query/real-pnl-query.module').then(
        (m) => m.RealPnlQueryModule,
      ),
  },
  {
    path: 'intraday-real-pnl-query',
    loadChildren: () =>
      import('./intraday-real-pnl-query/intraday-real-pnl-query.module').then(
        (m) => m.IntradayRealPnlQueryModule,
      ),
  },
  {
    path: 'hist-cash-div-query',
    loadChildren: () =>
      import('./hist-cash-div-query/hist-cash-div-query.module').then(
        (m) => m.HistCashDivQueryModule,
      ),
  },
  {
    path: 'intraday-unreal-pnl-query',
    loadChildren: () =>
      import(
        './intraday-unreal-pnl-query/intraday-unreal-pnl-query.module'
      ).then((m) => m.IntradayUnrealPnlQueryModule),
  },
  {
    path: 'daily-tasks-review',
    loadChildren: () =>
      import('./daily-tasks-review/daily-tasks-review.module').then(
        (m) => m.DailyTasksReviewModule,
      ),
  },
  {
    path: 'intraday-transfer-monitor',
    loadChildren: () =>
      import(
        './intraday-transfer-monitor/intraday-transfer-monitor.module'
      ).then((m) => m.IntradayTransferMonitorModule),
  },
  {
    path: 'transfer-monitor',
    loadChildren: () =>
      import('./transfer-monitor/transfer-monitor.module').then(
        (m) => m.TransferMonitorModule,
      ),
  },
  {
    path: 'pre-market-check',
    loadChildren: () =>
      import('./pre-market-check/pre-market-check.module').then(
        (m) => m.PreMarketCheckModule,
      ),
  },
  {
    path: 'branch-status-query',
    loadChildren: () =>
      import('./branch-status-query/branch-status-query.module').then(
        (m) => m.BranchStatusQueryModule,
      ),
  },
  {
    path: 'after-market-database-count',
    loadChildren: () =>
      import(
        './after-market-database-count/after-market-database-count.module'
      ).then((m) => m.AfterMarketDatabaseCountModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
