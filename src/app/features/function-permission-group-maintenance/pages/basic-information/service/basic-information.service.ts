import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { GroupDataQueryRequest } from '../models/group-data-query-request.model';
import { Observable } from 'rxjs';
import { GroupDataQueryResponse } from '../models/group-data-query-response.model';
import { GroupDataDelete } from '../models/group-data-delete.model';

@Injectable({
  providedIn: 'root'
})
export class BasicInformationService {

  // 基礎API URL，從環境配置中取得
  baseApiUrl = environment.apiEndpoint;

  constructor(private httpClient: HttpClient) { }

  /**
   * 查詢
   * @param params 查詢請求的參數
   * @returns 傳回一個 Observable
   */
  getBasicInformationData(
    params: GroupDataQueryRequest,
  ): Observable<GroupDataQueryResponse[]> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrSystemGroup`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/basic-information.json`;
    }
    // 發送 GET 請求以取得系統設定數據
    return this.httpClient.get<GroupDataQueryResponse[]>(endpoint, {
      params: { ...params },
    });
  }
  /**
   * 刪除
   * @param params 刪除請求的參數
   * @returns 傳回一個 Observable，發出刪除操作的結果
   */
  deleteBasicInformationData(
    params: GroupDataDelete
  ): Observable<string> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrSystemGroup`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/basic-information.json`;
    }
    // 傳送 DELETE 請求以刪除系統配置數據
    return this.httpClient.delete<string>(endpoint, { body: params });
  }



  /**
 * 新增系統配置數據
 * @param params 要提交的數據
 * @returns 傳回一個 Observable，發出提交後的系統數據
 */
  postBasicInformationData(
    params: GroupDataQueryRequest,
  ): Observable<GroupDataQueryRequest[]> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrSystemGroup`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件，並使用 GET 請求模擬提交
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/basic-information.json`;
      return this.httpClient.get<GroupDataQueryRequest[]>(
        `${endpoint}`,
      );
    }
    // 發送 POST 請求以提交系統數據
    return this.httpClient.post<GroupDataQueryRequest[]>(
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
  putBasicInformationData(data: GroupDataQueryRequest,
  ): Observable<string> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrSystemGroup`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/basic-information.json`;
    }
    // 發送 PUT 請求以更新系統設定數據
    return this.httpClient.put<string>(endpoint, data);
  }

}