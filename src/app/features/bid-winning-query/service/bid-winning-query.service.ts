import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { map, Observable } from 'rxjs';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { BidWinningQueryRequest } from '../models/bid-winning-query-resquest.model';
import { BidWinningQueryResponse } from '../models/bid-winning-query-response.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';

@Injectable({
  providedIn: 'root',
})
export class BidWinningQueryService {
  baseApiUrl = environment.apiPlEndpoint; // 基礎 API URL，從環境配置中取得

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  getBidWinning(
    params: BidWinningQueryRequest,
  ): Observable<BidWinningQueryResponse[]> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`; // 定義 API 端點

    // 如果使用模擬數據，則更改端點為本機 JSON 文件
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/file/bid-winning-query.xml`;
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.BIDAUCTIONWIN },
    });

    const urlWithParams = `${endpoint}${httpParams.toString()}`;
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
            return this.xmlToJsonService.extractNode(
              'win_detail',
              jsonResponse,
            );
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }
}
