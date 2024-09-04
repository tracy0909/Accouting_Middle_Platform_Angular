import { environment } from '@environment';
import { Injectable } from '@angular/core';

/**
 * 轉換測試環境讀取 assets mock 資料的網址。
 *
 * @export
 * @class MockService
 */
@Injectable({
  providedIn: 'root'
})
export class MockService {

  constructor() { }

  /**
   * 為了轉換測試環境讀取 assets mock 資料的網址
   * mock 的資料檔案名稱統一取最後一段的網址，然後在前面加上 _，副檔名為 .json
   * 原因是因為像 auth/current/permission 和 auth/current 這兩個 api
   * 沒辦法透過 mock 資料夾的結構設計出優雅切換環境的寫法
   *
   * 只能處理非 RESTful 的網址，如果是 RESTful 的變化太多，目前還是得自己指定要去讀哪個 mock 檔
   *
   * @param endpoint API 的網址
   * @param mockFilePath 指定 assets/mock 下的檔案位置
   * @returns 如果是測試環境 assets/mock 的網址，會轉換成 mock 資料檔案的位址回傳
   */
  /*parseApiEndpoint(endpoint: string, mockFilePath?: string): string {
    let actualEndpoint  = endpoint;
    if (environment.apiMock) {
      // 範例: api/v1/auth/current/permissions?site=authmgmt
      // 目的: 轉換成 assets/mock/api/v1/auth/current/permissions.json
      const mockPrefix = 'assets/mock';

      //  如果有指定檔案，就直接用那個檔案
      if (mockFilePath) {
        actualEndpoint = mockPrefix + mockFilePath;
      } else {
        // 判斷網址是否有用 ? 接參數，如果有只要取問號前面的字
        let lastIndexOfQuestionMark  = endpoint.lastIndexOf('?') > 0 ? endpoint.lastIndexOf('?') : endpoint.length;
        actualEndpoint = mockPrefix + endpoint.substring(0, lastIndexOfQuestionMark) + '.json';
      }
    }
    return actualEndpoint;
  }*/

  // 上面是之前 ITU8 用的轉換方式，現在 API 會走 APIM，所以上面的轉換已經不適用，改為下面方式

  /**
   * 為了轉換測試環境讀取 assets mock 資料的網址
   * mock 的資料檔案名稱統一取最後一段的網址，然後在前面加上 _，副檔名為 .json
   * 原因是因為像 auth/current/permission 和 auth/current 這兩個 api
   * 沒辦法透過 mock 資料夾的結構設計出優雅切換環境的寫法
   *
   * 只能處理非 RESTful 的網址，如果是 RESTful 的變化太多，目前還是得自己指定要去讀哪個 mock 檔
   *
   * @param endpoint API 的網址
   * @param mockFilePath 指定 assets/mock 下的檔案位置
   * @returns 如果是測試環境 assets/mock 的網址，會轉換成 mock 資料檔案的位址回傳
   */
  parseApiEndpoint(endpoint: string, mockFilePath?: string): string {
    let actualEndpoint  = endpoint;
    if (environment.apiMock) {
      // 範例: https://itu7-apim.azure-api.net/api/v1/auth/current/permissions?site=authmgmt
      // 目的: 轉換成 assets/mock/api/v1/auth/current/permissions.json
      const mockPrefix = 'assets/mock';

      //  如果有指定檔案，就直接用那個檔案
      if (mockFilePath) {
        actualEndpoint = mockPrefix + mockFilePath;
      } else {
        // 先把 apiEndpoint 去除
        let endpointExcludeApiEndpoint = endpoint.replace(`${environment.apiEndpoint}`, '');

        // 判斷網址是否有用 ? 接參數，如果有只要取問號前面的字
        let lastIndexOfQuestionMark  = endpointExcludeApiEndpoint.lastIndexOf('?') > 0 ? endpoint.lastIndexOf('?') : endpoint.length;
        actualEndpoint = mockPrefix + endpointExcludeApiEndpoint.substring(0, lastIndexOfQuestionMark) + '.json';
      }
    }
    return actualEndpoint;
  }

}
