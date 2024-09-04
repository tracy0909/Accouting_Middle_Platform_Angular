import { Router, NavigationEnd } from '@angular/router'
import { Injectable } from '@angular/core';
import { Location } from '@angular/common'

/**
 * 導航的服務。
 * 直接用 this.location.back()，如果歷史記錄中將沒有條目可返回，會跳出 Angular 服務。
 * 這個服務如果從當前 URL 返回後，歷史記錄中仍然包含記錄，可以安全地導航 back。否則，將退回到應用程序根目錄。
 * 參考網址: https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page
 *
 * @export
 * @class NavigationService
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private history: string[] = []

  constructor(private router: Router,
    private location: Location) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  back(): void {
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
