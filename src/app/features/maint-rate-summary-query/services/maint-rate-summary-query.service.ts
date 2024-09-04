import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable, map } from 'rxjs';

import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { SearchParams } from '../models/search-params.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class MaintRateSummaryQueryService {
  baseApiUrl = environment.apiPlEndpoint; // 基礎 API URL，從環境配置中取得
  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  getKeepRate(params: SearchParams): Observable<ApiResponse | string> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`; // 定義 API 端點

    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/file/maint-rate-summary-query.xml`;
    }
    const httpParams = new HttpParams({
      fromObject: {
        ...params,
        Qtype: QtypeParamsSetting.MAINT_RATE_SUMMARY_QUERY,
      },
    });

    const urlWithParams = `${endpoint}${httpParams.toString()}`;
    console.log(`Request URL: ${urlWithParams}`);
    // 發送 GET 請求以取得分公司管理數據
    return this.http
      .get(endpoint, { responseType: 'text', params: httpParams })
      .pipe(
        map((xmlResponse) => {
          const trimmedXmlResponse = xmlResponse.trim();
          const jsonResponse =
            this.xmlToJsonService.xmlToJson(trimmedXmlResponse);
          const errcode = this.xmlToJsonService.extractNode(
            'errcode',
            jsonResponse,
          )[0];
          if (
            errcode === '0000' ||
            (Array.isArray(errcode) && errcode.length === 0)
          ) {
            return {
              details: this.xmlToJsonService.extractNode(
                'detail',
                jsonResponse,
              ),
              root: this.xmlToJsonService.extractNode('root', jsonResponse),
            };
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }
}
