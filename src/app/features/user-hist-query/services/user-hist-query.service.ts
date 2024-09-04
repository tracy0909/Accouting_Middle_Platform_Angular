import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { UserHistQueryResquest } from '../models/user-hist-query-resquest.model';
import { Observable } from 'rxjs';
import { UserHistQueryResponse } from '../models/user-hist-query-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserHistQueryService {
  baseApiUrl = environment.apiEndpoint;

  constructor(private httpClient: HttpClient) {}

  getUserHistQueryData(
    params: UserHistQueryResquest,
  ): Observable<UserHistQueryResponse[]> {
    let endpoint: string = `${this.baseApiUrl}/UserLogs`;
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/user-hist-query.json`;
    }
    return this.httpClient.get<UserHistQueryResponse[]>(endpoint, {
      params: { ...params },
    });
  }
}
