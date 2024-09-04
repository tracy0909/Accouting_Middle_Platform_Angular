import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable, map } from 'rxjs';
import { Stock } from 'src/app/shared/models/stock.model';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { HistStmtQueryRequest } from '../models/hist-stmt-query-request.model';

@Injectable({
  providedIn: 'root'
})
export class HistStmtQueryService {
  baseApiUrl = environment.apiPlEndpoint; // 基礎 API URL，從環境配置中取得
  stockApiUrl = environment.apiEndpoint; // 基礎 API URL，從環境配置中取得

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService
  ) { }

  getHisstatement(params: HistStmtQueryRequest): Observable<any> {
    // console.log(params);
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`; // 定義 API 端點
    // console.log(endpoint);
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/file/hist-stmt-query.xml`; // 使用本地模擬數據
    }

    const httpParams = new HttpParams({ fromObject: { ...params, Qtype: 'hisstatement' } });
    console.log(`Request URL: ${endpoint}?${httpParams.toString()}`); // 打印完整請求 URL

    // 發送 GET 請求以取得歷史對帳單數據
    return this.http.get(endpoint, { responseType: 'text', params: httpParams }).pipe(
      map((xmlResponse) => {
        const trimmedXmlResponse = xmlResponse.trim(); // 修剪回應中的多餘空白
        const jsonResponse = this.xmlToJsonService.xmlToJson(trimmedXmlResponse); // 將 XML 轉換為 JSON
        const errcode = this.xmlToJsonService.extractNode("errcode", jsonResponse)[0]; // 提取錯誤代碼

        // 如果錯誤代碼為 "0000" 或無錯誤代碼則取數據
        if (errcode === "0000" || (Array.isArray(errcode) && errcode.length === 0)) {
          const response = {
            creditsum: this.xmlToJsonService.extractNode("creditsum", jsonResponse), // 信用資訊彙總
            settlementinfo: this.xmlToJsonService.extractNode("settlementinfo", jsonResponse), // 交割金資訊
            root: this.xmlToJsonService.extractNode("root", jsonResponse), // 歷史對帳單彙總
            profile: this.xmlToJsonService.extractNode("profile", jsonResponse) // 歷史對帳單明細（部分）
          };
          return response;
        } else {
          return this.xmlToJsonService.extractNode("msg", jsonResponse)[0]; // 返回錯誤信息
        }
      })
    );
  }

  queryStock(param: string) {
    let endpoint: string = `${this.stockApiUrl}/StockInfo`;
    if (environment.apiMock) {
      return this.http.get<any[]>(
        'assets/mock/api/v1/file/stock-code.json',
      );
    }
    return this.http.get<Stock[]>(endpoint,
      { params: { stock: param } }
    );
  }
}
