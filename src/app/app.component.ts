import { LoadingMaskService } from './shared/services/loading-mask.service';
import { SystemMessageService } from './shared/services/system-message.service';

import { NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { delay, filter, Subject, takeUntil } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { DomHandler } from 'primeng/dom';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isIframe: boolean = false;
  loginDisplay: boolean = false;
  showLoadingMask: boolean = false;

  private readonly _destroying$ = new Subject<void>();

  constructor(
    private primengConfig: PrimeNGConfig,
    private title: Title,
    private loadingMaskService: LoadingMaskService,
    private router: Router,
    private systemMessageService: SystemMessageService
  ) {
  }

  ngOnInit() {
    // 清除所有 localStorage 儲存資料
    localStorage.clear();

    this.primengConfig.ripple = true;

    this.isIframe = window !== window.parent && !window.opener;

    this.loadingMaskService.status$
      .pipe(delay(1), takeUntil(this._destroying$))
      .subscribe((val: boolean) => {
        this.showLoadingMask = val;
      });

    // 當 router 換頁後清除所有顯示的訊息
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this._destroying$)
      )
      .subscribe(() => this.systemMessageService.clear());
  }

  /**
   * 在第一個 Dialog 未關閉的狀況下，裡面如果出現提示訊息，或是又開另一個 Dialog，又關閉會出現另一條 scrollbar，
   * 這個是把第二條 scrollbar 取消
   */
  confirmDialogHide(): void {
    // 第一層是為了解決開啟 Dialog 後，按下刪除，會直接把 Dialog 關閉，這時候馬上去偵測 'p-dynamicdialog' 其實還在
    // 如果這時候把 scrollbar 取消，回到前面畫面就不能捲了
    setTimeout(() => {
      if (DomHandler.findSingle(document.body, 'p-dynamicdialog')) {
        let id = setInterval(() => {
          if (!DomHandler.hasClass(document.body, 'p-overflow-hidden')) {
            DomHandler.addClass(document.body, 'p-overflow-hidden');
          }
        }, 50);

        setTimeout(() => {
          clearInterval(id);
        }, 1000);
      }
    }, 1000);
  }

  ngOnDestroy() {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
