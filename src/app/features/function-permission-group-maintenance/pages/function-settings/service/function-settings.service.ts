import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { FunctionSettingRequest } from '../models/function-settings-request.model';
import { FunctionSettingResponse } from '../models/function-settings-response.model';
import { FunctionGroupSettingEditRequest } from '../models/function-group-setting-edit-request.model';
import { Observable } from 'rxjs';
import { FunctionGroupSettingDeleteRequest } from '../models/function-group-setting-delete-request.model';

@Injectable({
  providedIn: 'root',
})
export class FunctionSettingsService {
  baseApiUrl = environment.apiEndpoint;

  constructor(private httpClient: HttpClient) {}

  // 點擊功能清單設定取得所有資料顯示在列表中
  getFunctionSettingData(
    params: FunctionSettingRequest,
  ): Observable<FunctionSettingResponse[]> {
    // 定義 API 端點
    let endpoint: string = `${this.baseApiUrl}/MgrSystemGroup`;
    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/function-settings.json`;
    }
    // 發送 GET 請求以取得系統設定數據
    return this.httpClient.get<FunctionSettingResponse[]>(endpoint, {
      params: {
        DBSource: params.DBSource,
        GroupId: params.GroupId,
        GroupName: params.GroupName,
        Status: params.Status,
        UserId: '',
      },
    });
  }

  // 取得目前每個群組的權限設定放到彈跳視窗中
  getFunctionGroupSettingEditData(
    params: FunctionGroupSettingEditRequest,
  ): Observable<any> {
    let endpoint: string = `${this.baseApiUrl}/MgrAccessRight`;

    if (environment.apiMock) {
      endpoint =
        'assets/mock/api/v1/json-file/function-group-setting-edit.json';
      return this.httpClient.get(endpoint);
    }

    let httpParams = new HttpParams()
      .set('DBSource', params.DBSource)
      .set('GroupId', params.GroupId);

    // console.log('Sending request to:', endpoint);
    // console.log('With params:', httpParams.toString());

    return this.httpClient.get(endpoint, { params: httpParams });
  }

  // 儲存群組設定方法
  saveFunctionGroupSetting(requestBody: any): Observable<any> {
    let endpoint: string = `${this.baseApiUrl}/MgrAccessRight`;

    if (environment.apiMock) {
      endpoint =
        'assets/mock/api/v1/json-file/function-group-setting-edit.json';
      return this.httpClient.get(endpoint);
    }

    // 使用 console.log 顯示 requestBody 的內容ㄑㄧㄥ
    // console.log(
    //   '服務中查看儲存的格式內容:',
    //   JSON.stringify(requestBody, null, 2),
    // );

    // 發送 PUT 請求
    return this.httpClient.put(endpoint, requestBody);
  }

  // 清空群組設定（使用 DELETE 方法）
  clearFunctionGroupSetting(params: FunctionGroupSettingDeleteRequest): Observable<any> {
    let endpoint: string = `${this.baseApiUrl}/MgrAccessRight`;

    if (environment.apiMock) {
      endpoint =
        'assets/mock/api/v1/json-file/function-group-setting-edit.json';
      // 如果使用模擬，可能需要使用 GET 请求
      return this.httpClient.get(endpoint);
    }

    // 添加 console.log 來顯示請求內容
    // console.log('清除群組設定的請求內容:', JSON.stringify(params, null, 2));

    // 使用 DELETE 方法
    return this.httpClient.delete(endpoint, {
      body: params,
    });
  }
}
