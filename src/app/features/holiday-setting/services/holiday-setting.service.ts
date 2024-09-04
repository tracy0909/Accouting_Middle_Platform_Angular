import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { holidaySettingReq } from '../models/holiday-setting.model';
import { holidaySettingResponse } from '../models/holiday-setting.response.model';
import { HolidaySettingParams } from '../models/holiday-setting-save.model';

@Injectable({
  providedIn: 'root',
})
export class HolidaySettingService {
  baseApiUrl = environment.apiEndpoint;

  constructor(private httpClient: HttpClient) {}

  // 取得放假日串 API 方式
  getHolidays(params: holidaySettingReq): Observable<holidaySettingResponse[]> {
    let endpoint: string = '';
    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/json-file/holiday-setting.json';
    } else {
      endpoint = `${this.baseApiUrl}/TradingDays`;
    }
    return this.httpClient.get<holidaySettingResponse[]>(endpoint, {
      params: { ...params },
    });
  }

  // 儲存 API
  putHolidays(
    params: HolidaySettingParams,
  ): Observable<{ ErrCode: number; ErrMsg: string }> {
    let endpoint: string = `${this.baseApiUrl}/TradingDays`;

    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/json-file/holiday-setting.json';
      console.log('使用模擬數據進行保存:', endpoint);
      return this.httpClient.get<{ ErrCode: number; ErrMsg: string }>(endpoint);
    } else {
      const url = `${endpoint}`;
      return this.httpClient.put<{ ErrCode: number; ErrMsg: string }>(
        url,
        params,
      );
    }
  }
}
