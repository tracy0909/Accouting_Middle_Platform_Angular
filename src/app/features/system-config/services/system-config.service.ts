import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { QuerySystemConfigResponse } from '../models/query-system-config-response.model';
import { QuerySystemConfigRequest } from '../models/query-system-config-request.model';
import { AddOrUpdateSystemConfigRequest } from '../models/add-or-update-system-config-request.model';
import { DeleteSystemDataParams } from '../models/delete-system-data-params';

@Injectable({
  providedIn: 'root',
})
export class SystemConfigService {
  // 基礎API URL，從環境配置中取得
  baseApiUrl = environment.apiEndpoint;

  constructor(private httpClient: HttpClient) { }

  /**
   * 查詢系統設定數據
   * @param params 查詢請求的參數
   * @returns 傳回一個 Observable，發出系統設定數據
   */
  getSystemDataManagement(
    params: QuerySystemConfigRequest,
  ): Observable<QuerySystemConfigResponse[]> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/SysConfig`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/system-config.json`;
    }

    // 發送 GET 請求以取得系統設定數據
    return this.httpClient.get<QuerySystemConfigResponse[]>(endpoint, {
      params: {
        DBSource: params.DBSource,
        VarName: params.VarName,
        Number: params.Number,
        Value: params.Value,
        VarDesc: params.VarDesc,
      },
    });
  }

  /**
   * 刪除系統配置數據
   * @param params 刪除請求的參數
   * @returns 傳回一個 Observable，發出刪除操作的結果
   */
  deleteSystemData(
    params: DeleteSystemDataParams,
  ): Observable<string> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/SysConfig`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/system-config-delete.json`;
    }
    // 傳送 DELETE 請求以刪除系統配置數據
    return this.httpClient.delete<string>(endpoint, { body: params });
  }

  /**
   * 新增系統配置數據
   * @param params 要提交的數據
   * @returns 傳回一個 Observable，發出提交後的系統數據
   */
  postSystemDataManagement(
    params: AddOrUpdateSystemConfigRequest,
  ): Observable<AddOrUpdateSystemConfigRequest[]> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/SysConfig`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件，並使用 GET 請求模擬提交
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/system-config.json`;
      return this.httpClient.get<AddOrUpdateSystemConfigRequest[]>(
        `${endpoint}`,
      );
    }
    // 發送 POST 請求以提交系統數據
    return this.httpClient.post<AddOrUpdateSystemConfigRequest[]>(
      `${endpoint}`,
      params,
    );
  }

  /**
   * 修改系統設定數據
   * @param varName 要更新的資料的 VarName
   * @param numberValue 要更新的資料的 Number
   * @param data 更新的數據
   * @returns 傳回一個 Observable，發出更新操作的結果
   */
  putSystemData(data: AddOrUpdateSystemConfigRequest,
  ): Observable<string> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/SysConfig`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/system-config-update.json`;
    }
    // 發送 PUT 請求以更新系統設定數據
    return this.httpClient.put<string>(endpoint, data);
  }
}
