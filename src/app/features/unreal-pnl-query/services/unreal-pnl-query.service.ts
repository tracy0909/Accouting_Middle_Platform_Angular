import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { map, Observable } from 'rxjs';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { UnrealPnlQueryRequest } from '../models/unreal-pnl-query-request.model';
import { UnrealPnlQueryResponse } from '../models/unreal-pnl-query-response.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';
import { UnrealPnlQueryDetailResponse } from '../models/unreal-pnl-query-detail-response.model';
import { UnrealPnlQueryDetailRequest } from '../models/unreal-pnl-query-detail-request.model';

@Injectable({
  providedIn: 'root',
})
export class UnrealPnlQueryService {
  private baseApiUrl = environment.apiPlEndpoint;

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  // 彙總查詢
  getUnrealPnlQueryData(
    params: UnrealPnlQueryRequest,
  ): Observable<UnrealPnlQueryResponse | string> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`;
    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/file/unreal-pnl-query.xml';
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.UNREAL_PRTLOS_Sum },
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
              unreal_sums: this.xmlToJsonService.extractNode(
                'unreal_sum',
                jsonResponse,
              ),
            };
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
  getUnrealPnlQueryDetailData(
    params: UnrealPnlQueryDetailRequest,
  ): Observable<UnrealPnlQueryDetailResponse[]> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`;
    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/file/unreal-pnl-query-detail.xml';
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.UNREAL_PRTLOS_DETAIl },
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
              'unreal_detail',
              jsonResponse,
            );
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }
}
