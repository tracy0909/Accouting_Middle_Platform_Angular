import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { SearchParams } from '../models/search-params.model';
import { QueryList } from '../models/query-list.model';

@Injectable({
  providedIn: 'root',
})
export class AfterMarketDatabaseCountService {
  baseApiUrl = environment.apiEndpoint; // 基礎API URL，從環境配置中取得
  constructor(private http: HttpClient) {}

  getCheckSums(params: SearchParams): Observable<QueryList[]> {
    let endpoint: string = `${this.baseApiUrl}/CheckSum`; // 定義 API 端點
    // 如果使用模擬數據，則更改端點為本機 JSON 文件

    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/after-market-database-count.json`;
    }
    const httpParams = new HttpParams({
      fromObject: {
        ...params,
      },
    });

    const urlWithParams = `${endpoint}${httpParams.toString()}`;
    console.log(`Request URL: ${urlWithParams}`);
    return this.http.get<QueryList[]>(endpoint, {
      params: httpParams,
    });
  }
}
