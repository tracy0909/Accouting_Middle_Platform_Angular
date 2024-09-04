import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';
import { map, Observable } from 'rxjs';
import { IntradayRealPnlQueryRequest } from '../models/intraday-real-pnl-query-resquest.model';
import { IntradayRealPnlQueryResponse } from '../models/intraday-real-pnl-query-response.model';
import { IntradayRealPnlDetailQueryRequest } from '../models/intraday-real-pnl-detail-query-resquest.model';
import { IntradayRealPnlDetailQueryResponse } from '../models/intraday-real-pnl-detail-query-response.model';

@Injectable({
  providedIn: 'root'
})
export class IntradayRealPnlQueryService {
  baseApiUrl = environment.apiPlEndpoint; // 基礎 API URL，從環境配置中取得

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) { }

  getIntradayRealPnl(
    params: IntradayRealPnlQueryRequest,
  ): Observable<IntradayRealPnlQueryResponse | string> {
    // console.log(params);
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`; // 定義 API 端點
    // console.log(endpoint);
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/file/intraday-real-pnl-query.xml`; // 使用本地模擬數據
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.CNTD_REAL_PRT_LOS_SUM },
    });
    // console.log(`Request URL: ${endpoint}?${httpParams.toString()}`); // 打印完整請求 URL

    // 發送 GET 請求以取得歷史對帳單數據
    return this.http
      .get(endpoint, { responseType: 'text', params: httpParams })
      .pipe(
        map((xmlResponse) => {
          this.xmlToJsonService.testing()
          const trimmedXmlResponse = xmlResponse.trim();
          // console.log(trimmedXmlResponse)// 修剪回應中的多餘空白
          const jsonResponse =
            this.xmlToJsonService.xmlToJson(trimmedXmlResponse); // 將 XML 轉換為 JSON
          // console.log(jsonResponse)
          // this.extractNode("lend_sum", this.xmlToJson(this.testingData))
          const errcode = this.xmlToJsonService.extractNode(
            'errcode',
            jsonResponse,
          )[0]; // 提取錯誤代碼

          // 如果錯誤代碼為 "0000" 或無錯誤代碼則取數據
          if (
            errcode === '0000' ||
            (Array.isArray(errcode) && errcode.length === 0)
          ) {
            const response = {
              root: this.xmlToJsonService.extractNode("root", jsonResponse), // 歷史對帳單彙總
              cntd_profit_sums: this.xmlToJsonService.extractNode(
                'cntd_profit_sum',
                jsonResponse,
              ),
            };
            // console.log(response)
            return response;
          } else {
            return this.xmlToJsonService.extractNode(
              'msg',
              jsonResponse,
            )[0] as string; // 返回錯誤信息
          }
        }),
      );
  }

  getIntradayRealPnlDetail(
    params: IntradayRealPnlDetailQueryRequest,
  ): Observable<IntradayRealPnlDetailQueryResponse | string> {
    // console.log(params);
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`; // 定義 API 端點
    // console.log(endpoint);
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/file/intraday-real-pnl-detail-query.xml`; // 使用本地模擬數據
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.CNTD_REAL_PRT_LOS_DETAIL },
    });
    // console.log(`Request URL: ${endpoint}?${httpParams.toString()}`); // 打印完整請求 URL

    // 發送 GET 請求以取得歷史對帳單數據
    return this.http
      .get(endpoint, { responseType: 'text', params: httpParams })
      .pipe(
        map((xmlResponse) => {
          this.xmlToJsonService.testing()
          const trimmedXmlResponse = xmlResponse.trim();
          // console.log(trimmedXmlResponse)// 修剪回應中的多餘空白
          const jsonResponse =
            this.xmlToJsonService.xmlToJson(trimmedXmlResponse); // 將 XML 轉換為 JSON
          // console.log(jsonResponse)
          // this.extractNode("lend_sum", this.xmlToJson(this.testingData))
          const errcode = this.xmlToJsonService.extractNode(
            'errcode',
            jsonResponse,
          )[0]; // 提取錯誤代碼

          // 如果錯誤代碼為 "0000" 或無錯誤代碼則取數據
          if (
            errcode === '0000' ||
            (Array.isArray(errcode) && errcode.length === 0)
          ) {
            const response = {
              cntd_profit_details: this.xmlToJsonService.extractNode(
                'cntd_profit_detail',
                jsonResponse,
              ),
            };
            // console.log(response)
            return response;
          } else {
            return this.xmlToJsonService.extractNode(
              'msg',
              jsonResponse,
            )[0] as string; // 返回錯誤信息
          }
        }),
      );
  }

}
