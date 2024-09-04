import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import {
  QuoteQueryResponse,
  QuoteServer,
} from '../models/quote-query-response.model';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { QuoteQueryResquest } from '../models/quote-query-resquest.model';
import { Config, DbSetting } from 'src/app/shared/models/config.model';

@Injectable({
  providedIn: 'root',
})
export class QuoteQueryService {
  baseApiUrl: QuoteServer[] = [];

  constructor(
    private httpClient: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  // 改成從 Json 讀取( mock data )
  loadServerConfig(): Observable<DbSetting[]> {
    return this.httpClient
      .get<Config>('assets/mock/api/v1/config-json/quote-query-server.json')
      .pipe(
        map((data) => {
          return data.dbSetting;
        }),
      );
  }

  // 查詢取得股票代號資訊
  getQuoteQueryData(
    params: QuoteQueryResquest,
    api: QuoteServer,
  ): Observable<QuoteQueryResponse[]> {
    const endpoint = environment.apiMock
      ? `assets/mock/api/v1/file/${api.name}.xml`
      : `${api.urlPath}/Quote/Stock.jsp?stock=${params.stock}`;

    return this.httpClient.get(endpoint, { responseType: 'text' }).pipe(
      tap((xmlResponse) => {
        // console.log('Get XML format:', xmlResponse);
      }),
      map((xmlResponse, index) => {
        // 去除 XML 字串的前後空格
        const trimmedXmlResponse = xmlResponse.trim();
        // 使用 xmlToJsonService 將 XML 轉為 JSON
        const jsonResponse =
          this.xmlToJsonService.xmlToJson(trimmedXmlResponse);
        // console.log('Converted JSON format:', jsonResponse);
        const errcode = this.xmlToJsonService.extractNode(
          'errcode',
          jsonResponse,
        );
        if (
          errcode === '0000' ||
          (Array.isArray(errcode) && errcode.length === 0)
        ) {
          // 轉換後的 JSON 資料賦值給 data
          const data = this.xmlToJsonService.extractNode(
            'Symbol',
            jsonResponse,
          ) as QuoteQueryResponse[];
          // 填入報價主機的欄位名稱
          // data.forEach((item) => (item.endpoint = api.name));
          // 返回轉換格式後的資料
          return data;
        } else {
          const msg = this.xmlToJsonService.extractNode('msg', jsonResponse);
          return msg;
        }
      }),
      catchError((error) => {
        console.error(`Error converting data from ${api.name}:`, error);
        return of([]);
      }),
    );
  }
}
