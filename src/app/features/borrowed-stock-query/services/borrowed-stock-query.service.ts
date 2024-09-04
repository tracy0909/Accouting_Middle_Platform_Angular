import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { BorrowedStockQueryRequest } from '../models/borrowed-stock-query-request.model';
import { BorrowedStockQueryResponse } from '../models/borrowed-stock-query-response.model';
import { map, Observable } from 'rxjs';
import { BorrowedDnamtQueryRequest } from '../models/borrowed-dnamt-query-request.model';
import { BorrowedDnamtQueryResponse } from '../models/borrowed-dnamt-query-response.model';
import { BorrowedReplyQueryResponse } from '../models/borrowed-reply-query-response.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';

@Injectable({
  providedIn: 'root',
})
export class BorrowedStockQueryService {
  private baseApiUrl = environment.apiPlEndpoint;

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  /**
   * 共用方法，依參數、類型取得資料
   * @param params request 參數
   * @param qtype request 指定參數
   * @param nodeName 從 xnl response 取資料的節點
   * @param mockUrl mock data
   * @returns
   */
  private fetchData(
    params:
      | BorrowedStockQueryRequest
      | BorrowedDnamtQueryRequest
      | BorrowedDnamtQueryRequest,
    qtype: string,
    nodeName: string,
    mockUrl: string,
  ): Observable<
    | BorrowedStockQueryResponse[]
    | BorrowedDnamtQueryResponse[]
    | BorrowedReplyQueryResponse[]
  > {
    let endpoint: string = mockUrl;
    if (!environment.apiMock) {
      endpoint = `${params.APISERVER}${this.baseApiUrl}`;
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: qtype },
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
            return this.xmlToJsonService.extractNode(nodeName, jsonResponse);
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }

  // 查詢
  getBorrowedStockQueryData(
    params: BorrowedStockQueryRequest,
  ): Observable<BorrowedStockQueryResponse[]> {
    const mockUrl = 'assets/mock/api/v1/file/borrowed-stock-query.xml';
    return this.fetchData(
      params,
      QtypeParamsSetting.QUERY_BORROW,
      'detail',
      mockUrl,
    ) as Observable<BorrowedStockQueryResponse[]>;
  }

  // 擔保品查詢
  getBorrowedStockDnamtData(
    params: BorrowedDnamtQueryRequest,
  ): Observable<BorrowedDnamtQueryResponse[]> {
    const mockUrl = 'assets/mock/api/v1/file/borrowed-stock-dnamt.xml';
    return this.fetchData(
      params,
      QtypeParamsSetting.QUERY_BORROW_DNAMT,
      'dnamt_detail',
      mockUrl,
    ) as Observable<BorrowedDnamtQueryResponse[]>;
  }

  // 償還明細查詢
  getBorrowedStockReplyData(
    params: BorrowedDnamtQueryRequest,
  ): Observable<BorrowedReplyQueryResponse[]> {
    const mockUrl = 'assets/mock/api/v1/file/borrowed-stock-reply.xml';
    return this.fetchData(
      params,
      QtypeParamsSetting.QUERY_BORROW_REPLY,
      'reply_detail',
      mockUrl,
    ) as Observable<BorrowedReplyQueryResponse[]>;
  }
}
