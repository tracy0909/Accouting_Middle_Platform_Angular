import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { XmlToJsonService } from 'src/app/shared/services/xml-to-json.service';
import { BorrowedStockSearchRequest } from '../models/borrowed-stock-search-request.model';
import { QtypeParamsSetting } from 'src/app/shared/enum/qtype-params-setting.enum';
import { BorrowedStockSearch } from '../models/borrowed-stock-search.model';

@Injectable({
  providedIn: 'root',
})
export class BorrowedStockSearchService {
  private baseApiUrl = environment.apiPlEndpoint;

  constructor(
    private http: HttpClient,
    private xmlToJsonService: XmlToJsonService,
  ) {}

  getBorrowedStockSearch(
    params: BorrowedStockSearchRequest,
  ): Observable<BorrowedStockSearch[]> {
    let endpoint: string = `${params.APISERVER}${this.baseApiUrl}`;
    if (environment.apiMock) {
      endpoint = 'assets/mock/api/v1/file/borrowed-stock-search.xml';
    }
    const httpParams = new HttpParams({
      fromObject: { ...params, Qtype: QtypeParamsSetting.INVENTORY_BORROW },
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
            return this.xmlToJsonService.extractNode('inventory', jsonResponse);
          } else {
            return this.xmlToJsonService.extractNode('msg', jsonResponse)[0];
          }
        }),
      );
  }
}
