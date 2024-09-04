import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { CollateralValueQueryRequest } from '../models/collateral-value-query-resquest.model';
import { CollateralValueQueryResponse } from '../models/collateral-value-query-response.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';
@Injectable({
  providedIn: 'root'
})
export class CollateralValueQueryService {
  baseApiUrl = environment.apiPlEndpoint; // 基礎 API URL，從環境配置中取得

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService
  ) { }

  getCollateralValue(params: CollateralValueQueryRequest): Observable<CollateralValueQueryResponse> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`; // 定義 API 端點
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/file/collateral-value-query.xml`; // 使用本地模擬數據
    }

    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.LEND_UNREAL_DN_MARKET_VALUE },
    });

    // 發送 GET 請求以取得歷史對帳單數據
    return this.http.get(endpoint, { responseType: 'text', params: httpParams }).pipe(
      map((xmlResponse) => {
        const trimmedXmlResponse = xmlResponse.trim(); // 修剪回應中的多餘空白
        const jsonResponse = this.xmlToJsonService.xmlToJson(trimmedXmlResponse); // 將 XML 轉換為 JSON
        const errcode = this.xmlToJsonService.extractNode("errcode", jsonResponse)[0]; // 提取錯誤代碼

        // 如果錯誤代碼為 "0000" 或無錯誤代碼則取數據
        if (errcode === "0000" || (Array.isArray(errcode) && errcode.length === 0)) {
          return {
            creditdn_sum: this.xmlToJsonService.extractNode("creditdn_sum", jsonResponse),
            lenddn_sum: this.xmlToJsonService.extractNode("lenddn_sum", jsonResponse),
          };
        } else {
          return this.xmlToJsonService.extractNode("msg", jsonResponse)[0]; // 返回錯誤信息
        }
      })
    );
  }

}
