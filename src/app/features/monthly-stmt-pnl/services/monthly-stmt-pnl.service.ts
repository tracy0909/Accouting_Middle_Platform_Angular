import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { MonthlyStmtPnlRequest } from '../models/monthly-stmt-pnl-request.model';
import { MonthlyStmtPnlResponse } from '../models/monthly-stmt-pnl-response.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MonthlyStmtPnlService {
  private baseApiUrl = environment.apiPlEndpoint;

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  getMonthlyStmtPnlData(
    params: MonthlyStmtPnlRequest,
  ): Observable<MonthlyStmtPnlResponse[]> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`;
    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/file/monthly-stmt-pnl.xml';
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.GAIN_LOST_STATEMENT },
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
            return this.xmlToJsonService.extractNode('detail', jsonResponse);
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }
}
