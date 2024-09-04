import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { UserSettingsDataQueryRequest } from '../models/user-settings-query-request.model';
import { UserSettingsDataQueryResponse } from '../models/user-settings-query-response.model';
import { Observable } from 'rxjs';
import { MgrSystemUserDataQueryRequest } from '../models/mgr-system-user-query-request.model';
import { MgrSystemUserDataQueryResponse } from '../models/mgr-system-user-query-response.model';
import { MgrSystemUserDataPut } from '../models/mgr-system-user-put.model';
import { MgrSystemUserDataDeleteRequest } from '../models/mgr-system-user-del-request.model';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  // 基礎API URL，從環境配置中取得
  baseApiUrl = environment.apiEndpoint;

  constructor(private httpClient: HttpClient) { }

  /**
   * 查詢MgrSystemGroup
   * @param params 查詢請求的參數
   * @returns 傳回一個 Observable
   */
  getBasicInformationData(
    params: UserSettingsDataQueryRequest,
  ): Observable<UserSettingsDataQueryResponse[]> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrSystemGroup`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/user-settings.json`;
    }
    // 發送 GET 請求以取得系統設定數據
    return this.httpClient.get<UserSettingsDataQueryResponse[]>(endpoint, {
      params: { ...params },
    });
  }

  /**
   * 查詢MgrSystemUser
   * @param params 查詢請求的參數
   * @returns 傳回一個 Observable
   */
  getMgrSystemUserData(
    params: MgrSystemUserDataQueryRequest,
  ): Observable<MgrSystemUserDataQueryResponse[]> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrSystemUser`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/mgr-system-user.json`;
    }
    // 發送 GET 請求以取得系統設定數據
    return this.httpClient.get<MgrSystemUserDataQueryResponse[]>(endpoint, {
      params: { ...params },
    });
  }

  /**
 * 修改系統設定數據
 * @param varName 要更新的資料的 VarName
 * @param numberValue 要更新的資料的 Number
 * @param data 更新的數據
 * @returns 傳回一個 Observable，發出更新操作的結果
 */
  putBasicInformationData(data: MgrSystemUserDataPut,
  ): Observable<string> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrUserGroup/GroupToUser`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/mgr-system-user.json`;
    }
    // 發送 PUT 請求以更新系統設定數據
    return this.httpClient.put<string>(endpoint, data);
  }

  /**
   * 刪除
   * @param params 刪除請求的參數
   * @returns 傳回一個 Observable，發出刪除操作的結果
   */
  deleteMgrUserGroupData(
    params: MgrSystemUserDataDeleteRequest,
  ): Observable<string> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrUserGroup/GroupToUser`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/basic-information.json`;
    }
    // 傳送 DELETE 請求以刪除系統配置數據
    return this.httpClient.delete<string>(endpoint, { body: params });
  }
}
