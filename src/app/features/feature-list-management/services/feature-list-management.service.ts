import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { DialogParams } from '../models/dialog-params.model';
import { DeleteParams } from '../models/delete-params.model';
import { SearchParams } from '../models/search-params.model';
import { UserMenu } from '../models/user-menu.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class FeatureListManagementService {
  baseApiUrl = environment.apiEndpoint; // 基礎API URL，從環境配置中取得
  constructor(private http: HttpClient) {}

  getUserMenu(params: SearchParams): Observable<UserMenu[]> {
    let endpoint: string = `${this.baseApiUrl}/MgrUserMenu`; // 定義 API 端點
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/feature-list-management.json`;
    }
    return this.http.get<UserMenu[]>(endpoint, {
      params: { ...params },
    });
  }

  /**
   * 刪除系統配置數據
   * @param params 刪除請求的參數
   * @returns 傳回一個 Observable，發出刪除操作的結果
   */
  deleteTreeNode(params: DeleteParams): Observable<ApiResponse> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrUserMenu`;

    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/feature-list-management.json`;
      return this.http.get<ApiResponse>(`${endpoint}`);
    }
    return this.http.delete<ApiResponse>(`${endpoint}`, {
      body: { ...params },
    });
  }

  postTreeNode(params: DialogParams): Observable<ApiResponse> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrUserMenu`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/feature-list-management.json`;
      return this.http.get<ApiResponse>(`${endpoint}`);
    }
    return this.http.post<ApiResponse>(`${endpoint}`, params);
  }

  putTreeNode(params: DialogParams): Observable<ApiResponse> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrUserMenu`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/feature-list-management.json`;
      return this.http.get<ApiResponse>(`${endpoint}`);
    }
    return this.http.put<ApiResponse>(`${endpoint}`, params, {
      params: { moduleId: params.ModuleId },
    });
  }

  postTreeNodeStatus(params: any): Observable<ApiResponse> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrUserMenu/UserMenuStatus`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/feature-list-management.json`;
      return this.http.get<ApiResponse>(`${endpoint}`);
    }
    return this.http.post<ApiResponse>(`${endpoint}`, params);
  }
}
