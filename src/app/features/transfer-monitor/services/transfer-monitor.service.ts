import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environment';
import { ConversionMonitoring } from '../models/conversion-monitoring.model';
import { SearchParams } from '../models/search-params.model';
@Injectable({
  providedIn: 'root',
})
export class TransferMonitorService {
  baseApiUrl = environment.apiEndpoint; // 基礎API URL，從環境配置中取得
  constructor(private http: HttpClient) {}

  getConversionMonitoring(
    params: SearchParams,
  ): Observable<ConversionMonitoring[]> {
    let endpoint: string = `${this.baseApiUrl}/ConversionMonitoring`; // 定義 API 端點
    // 如果使用模擬數據，則更改端點為本機 JSON 文件

    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/transfer-monitor.json`;
    }
    const httpParams = new HttpParams({
      fromObject: {
        ...params,
        DBSource: params.DBSource,
      },
    });

    const urlWithParams = `${endpoint}${httpParams.toString()}`;
    // console.log(`Request URL: ${urlWithParams}`);
    return this.http.get<ConversionMonitoring[]>(endpoint, {
      params: httpParams,
    });
  }
}
