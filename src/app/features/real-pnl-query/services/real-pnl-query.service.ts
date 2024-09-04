import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { RealPnlQueryRequest } from '../models/real-pnl-query-request.model';
import { map, Observable } from 'rxjs';
import { RealPnlQueryResponse } from '../models/real-pnl-query-response.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';
import { RealPnlQueryDetailRequest } from '../models/real-pnl-query-detail-request.model';
import { RealPnlQueryDetailResponse } from '../models/real-pnl-query-detail-response.model';

@Injectable({
  providedIn: 'root',
})
export class RealPnlQueryService {
  private baseApiUrl = environment.apiPlEndpoint;

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  // 彙總查詢
  getRealPnlQueryData(
    params: RealPnlQueryRequest,
  ): Observable<RealPnlQueryResponse | string> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`;
    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/file/real-pnl-query.xml';
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.REAL_PRT_LOSSUM },
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
            const response = {
              root: this.xmlToJsonService.extractNode('root', jsonResponse),
              profit_sums: this.xmlToJsonService.extractNode(
                'profit_sum',
                jsonResponse,
              ),
            };
            // console.log(response);
            // 若errcode正確或沒有errcode則取資料
            return response;
          } else {
            return this.xmlToJsonService.extractNode(
              'msg',
              jsonResponse,
            )[0] as string;
          }
        }),
      );
  }

  // 明細查詢
  getRealPnlQueryDetailData(
    params: RealPnlQueryDetailRequest,
  ): Observable<RealPnlQueryDetailResponse[]> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`;
    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/file/real-pnl-query-detail.xml';
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.REAL_PRT_LOSDETAIL },
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
            return this.xmlToJsonService.extractNode(
              'profit_detail',
              jsonResponse,
            );
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }
}
