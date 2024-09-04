import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { HistRealPnlQueryRequest } from '../models/hist-real-pnl-query-request.model';
import { HistRealPnlQueryResponse } from '../models/hist-real-pnl-query-response.model';
import { map, Observable } from 'rxjs';
import { environment } from '@environment';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';

@Injectable({
  providedIn: 'root',
})
export class HistRealPnlQueryService {
  private baseApiUrl = environment.apiPlEndpoint;

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  getHistRealPnlQueryData(
    params: HistRealPnlQueryRequest,
  ): Observable<HistRealPnlQueryResponse[]> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`;
    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/file/hist-real-pnl-query.xml';
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.REAL_PRT_LOS_AMOUNT },
    });

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
            return this.xmlToJsonService.extractNode('root', jsonResponse);
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }
}
