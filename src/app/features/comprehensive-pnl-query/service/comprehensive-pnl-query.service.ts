import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { map, Observable } from 'rxjs';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { ComprehensivePnlQueryRequest } from '../models/comprehensive-pnl-query-resquest.model';
import { ComprehensivePnlQueryResponse } from '../models/comprehensive-pnl-query-response.model';


@Injectable({
  providedIn: 'root'
})
export class ComprehensivePnlQueryService {
  baseApiUrl = environment.apiPlEndpoint; // 基礎 API URL，從環境配置中取得

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) { }

  getComprehensivePnl(
    params: ComprehensivePnlQueryRequest,
  ): Observable<ComprehensivePnlQueryResponse | string> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`; // 定義 API 端點
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/file/comprehensive-pnl-query.xml`; // 使用本地模擬數據
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.INTEGRATED_PRTLOS },
    });

    // 發送 GET 請求以取得歷史對帳單數據
    return this.http
      .get(endpoint, { responseType: 'text', params: httpParams })
      .pipe(
        map((xmlResponse) => {
          const trimmedXmlResponse = xmlResponse.trim();
          const jsonResponse =
            this.xmlToJsonService.xmlToJson(trimmedXmlResponse); // 將 XML 轉換為 JSON
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
              unoffset_yests: this.xmlToJsonService.extractNode('unoffset_yest', jsonResponse),
              unoffset_tdyadds: this.xmlToJsonService.extractNode('unoffset_tdyadd', jsonResponse),
              offset_cdtds: this.xmlToJsonService.extractNode('offset_cdtd', jsonResponse),
              offset_tdys: this.xmlToJsonService.extractNode('offset_tdy', jsonResponse),
            };
            console.log(response);
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
