import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { map, Observable } from 'rxjs';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { SubResultQueryRequest } from '../models/sub-result-query-resquest.model';
import { SubResultQueryResponse } from '../models/sub-result-query-response.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';

@Injectable({
  providedIn: 'root'
})
export class SubResultQueryService {
  baseApiUrl = environment.apiPlEndpoint; // 基礎 API URL，從環境配置中取得

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService
  ) { }

  getSubResult(params: SubResultQueryRequest): Observable<SubResultQueryResponse[]> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`; // 定義 API 端點

    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/file/sub-result-query.xml`;
    }

    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.PUBLIC_OFFERING_SLOT },
    });


    const urlWithParams = `${endpoint}&${httpParams.toString()}`;
    console.log(`Request URL: ${urlWithParams}`);
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
            // 若errcode正確或沒有errcode則取資料
            return this.xmlToJsonService.extractNode('lot_detail', jsonResponse);
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }
}
