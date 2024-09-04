import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { SystemMessageService } from 'src/app/shared/services/system-message.service';
import { LoadingMaskService } from '../../shared/services/loading-mask.service';
import { AuthService } from '../services/auth.service';
import { StorageService } from 'src/app/base/services/storage.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private systemMessageService: SystemMessageService,
    private loadingMaskService: LoadingMaskService,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    console.log('HttpErrorInterceptor');

    console.log('HttpErrorInterceptor request.url = ' + request.url);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          console.log('This is client side error');
          errorMsg = `Error: ${error.error.message}`;
        } else {
          console.log('This is server side error');
          // 如果是 AAD login 失敗就直接轉到錯誤頁面
          if (request.url.startsWith('/api/v1/auth/loginSso')) {
            this.router.navigate(['/error']);
          }
          switch (error.status) {
            // 修改
            case 455:
              if (error.error && error.error.ErrCode) {
                this.storageService.setLocalStorageItem(
                  'ErrMsg',
                  error.error.ErrMsg,
                );
                this.authService.logout();
              }
              break;
            // case 401:
            // case 403:
            // case 405:
            case 500:
              this.systemMessageService.error('系統錯誤');
              break;
            // case 502:
            // case 503:
            // case 504:
            case 404:
              // TODO如果是手動登入的時候錯誤，改顯示訊息為帳號密碼錯誤
              if (request.url.startsWith('/api/v1/auth/login')) {
                errorMsg = '帳號密碼錯誤';
              } else {
                errorMsg += `404 伺服器找不到請求的資源.`;
              }
              this.systemMessageService.error(errorMsg);
              break;
            default:
              // errorMsg += `http-status.error`;
              this.showErrorMessage(error.error);
              break;
          }
          // const stackTrace: string = error.error.stackTrace;
          // errorMsg = `Error Code: ${error.status} ${error.statusText} \n`;
          // if (stackTrace) {
          //   errorMsg += `StackTrace: ${stackTrace?.substring(0, 300)} ...`;
          // } else {
          //   errorMsg += `Error: ${error.message}`;
          // }
        }

        // 先註解掉
        // if (error.status === 401) {
        //   console.log(
        //     'HttpErrorInterceptor this.authService.tokenError = ' +
        //       this.authService.tokenError,
        //   );
        //   if (this.authService.tokenError) {
        //     this.systemMessageService.error(errorMsg, {
        //       message: error.error?.message ?? '',
        //     });
        //   }
        // } else {
        //   this.systemMessageService.error(errorMsg, {
        //     message: error.error?.message ?? '',
        //   });
        // }

        this.loadingMaskService.hide();
        console.log(errorMsg);
        return throwError(() => error);
      }),
    );
  }

  private showErrorMessage(error: any) {
    let errorMsg = '';
    if (error.ErrCode) {
      errorMsg += error.ErrCode + ' ';
      errorMsg += error.ErrMsg + '\n';
    } else {
      //處理損益api例外情況
      if (error.status) {
        errorMsg += error.status + ' ';
        errorMsg += error.statusText + '\n';
      }
    }

    if (error.Errors) {
      error.Errors.forEach((err: { Field: string; Message: string }) => {
        errorMsg += `${err.Field}: ${err.Message}\n`;
      });
    }
    console.log(errorMsg);
    this.systemMessageService.error(errorMsg, {
      message: errorMsg ?? '系統錯誤',
    });
  }
}
