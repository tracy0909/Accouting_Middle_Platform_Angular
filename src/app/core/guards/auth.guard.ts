import { SidebarService } from '../../layout/services/sidebar.service';
import { SystemLocalStorage } from '../enum/system-local-storage.enum';
import { StorageService } from '../../base/services/storage.service';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, lastValueFrom } from 'rxjs';
import { AuthMenuService } from '../services/auth-menu.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
    private storageService: StorageService,
    private authMenuService: AuthMenuService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log(this.authService.getUser());
    if (this.authService.getUser()) {
      // 先試著從 localStorage 取得登入使用者的基本資訊
      // 如果有取到就代表可以通過 Guard 繼續訪問
      return this.checkPermission(state.url);
    } else {
      // 如果沒有取到的話代表需要重新進行認證
      console.log('AuthGuard state.url = ' + state.url.split('?')[0]);
      // 把 sessionStorage redirectUrl 清除
      // this.storageService.removeSessionStorageItem(
      //   SystemLocalStorage.REDIRECT_URL
      // );
      // 重新把目前的網址寫到 sessionStorage redirectUrl (不含網址後的參數)
      // this.storageService.setSessionStorageItem(
      //   SystemLocalStorage.REDIRECT_URL,
      //   state.url.split('?')[0]
      // );
      console.log('AuthGuard = ' + JSON.stringify(route.queryParams));
      // 把 sessionStorage queryParams 清除
      this.storageService.removeSessionStorageItem(
        SystemLocalStorage.QUERY_PARAMS
      );
      // 重新把目前的網址上的查詢參數寫到 sessionStorage queryParams
      this.storageService.setSessionStorageItem(
        SystemLocalStorage.QUERY_PARAMS,
        JSON.stringify(route.queryParams)
      );
      // 導到 RedirectComponent 處理登入驗證
      this.router.navigate(['/login']);
      return false;
    }
  }

  async checkPermission(url: string): Promise<boolean> {
    if (this.sidebarService.sidebarMenus.length == 0) {
      await lastValueFrom(this.sidebarService.getMenus());
    }
    // 調用 checkPermission 方法進行權限檢查
    const hasPermission = this.sidebarService.checkPermission(url);
    // 如果沒有權限，導航到 '/access-denied' 路由
    if (!hasPermission) {
      this.router.navigate(['/access-denied']);
    }
    // 做一層保險，如果 sessionStorage 中沒有紀錄 redirectMenuId
    if (
      !this.storageService.getSessionStorageItem(
        SystemLocalStorage.REDIRECT_MENUID
      )
    ) {
      this.storageService.setSessionStorageItem(
        SystemLocalStorage.REDIRECT_MENUID,
        this.authMenuService.getIdByUrl(url)
      );
    }
    return hasPermission;
  }
}
