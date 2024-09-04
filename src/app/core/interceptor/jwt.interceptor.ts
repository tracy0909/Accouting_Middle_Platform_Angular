import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../base/services/storage.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private storageService: StorageService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<any> {
    console.log('JwtInterceptor intercept');

    // add authorization header with jwt token if available
    let jwtToken = this.authService.getJwtToken();
    if (jwtToken) {
      // 所有透過瀏覽器發送的 HTTP 請求，都會先經過瀏覽器的快取，
      // 在這裡會先檢查是否有有效的快取內容可作為回應，如果有的話就直接讀取快取的內容，以減少網路的延遲和傳輸造成的成本。
      // 在判斷資源有沒有過期時，會先看 Cache-Control: max-age="..."，
      // 沒有的話才會去看 Expires；如果沒有 max-age 也沒有 Expires 的話，
      // 才會再進一步去看 Last-modified

      // 下面這麼多從哪抄來的，為什麼要這樣寫需要再確認
      request = request.clone({
        headers: request.headers
          .set('Cache-Control', 'no-cache') // 瀏覽器會快取所有內容，但每次都會發送請求向伺服器詢問是否有新內容要提供（永遠檢查快取）。
          .set('Pragma', 'no-cache')
          .set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT')
          .set('If-Modified-Since', '0')
          .set('Authorization', `Bearer ${jwtToken}`),
      });
    } else {
      console.log('JwtInterceptor localStorage no jwt token');
    }

    return next.handle(request)
  }
}
