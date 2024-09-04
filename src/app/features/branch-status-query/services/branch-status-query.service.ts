import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { BranchStatusQueryRequest } from '../models/branch-status-query-resquest.model';
import { BranchStatusQueryResponse } from '../models/branch-status-query-response.model';

@Injectable({
  providedIn: 'root'
})
export class BranchStatusQueryService {
  baseApiUrl = environment.apiEndpoint; // 基礎API URL，從環境配置中取得
  constructor(private httpClient: HttpClient) { }
  /**
   * 獲取分公司管理數據
   * @param params 請求參數，包括分公司管理的查詢條件
   * @returns 返回一個 Observable，發出分公司管理資料
   */
  getBranchStatus(
    params: BranchStatusQueryRequest
  ): Observable<BranchStatusQueryResponse[]> {
    let endpoint: string = `${this.baseApiUrl}/BhnoSettlement`; // 定義 API 端點
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/branch-status-query.json`;
    }
    // 發送 GET 請求以取得分公司管理數據
    return this.httpClient.get<BranchStatusQueryResponse[]>(endpoint, {
      params: { ...params },
    });
  }
}
