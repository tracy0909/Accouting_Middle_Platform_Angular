import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { LoginHistQueryRequest } from '../models/login-hist-query-request.model';
import { LoginHistQueryResponse } from '../models/login-hist-query-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginHistQueryService {
  baseApiUrl = environment.loginLogEndpoint;

  constructor(private httpClient: HttpClient) { }

  /**
   * 查詢
   * @param params 查詢請求的參數
   * @returns 傳回一個 Observable
   */
  getLoginHistQueryData(
    params: LoginHistQueryRequest,
  ): Observable<LoginHistQueryResponse[]> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/logs`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/login-hist-query.json`;
    }
    // 發送 GET 請求以取得系統設定數據
    return this.httpClient.get<LoginHistQueryResponse[]>(endpoint, {
      params: { ...params },
    });
  }
}
