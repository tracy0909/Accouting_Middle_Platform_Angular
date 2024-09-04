import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { map, Observable } from 'rxjs';
import { DailyTasksReviewRequest } from '../models/daily-tasks-review-request.model';
import { DailyTasksReviewResponse } from '../models/daily-tasks-review-response.model';

@Injectable({
  providedIn: 'root',
})
export class DailyTasksReviewService {
  baseApiUrl = environment.apiEndpoint;

  constructor(private httpClient: HttpClient) {}

  getdailyTsksReviewData(
    params: DailyTasksReviewRequest,
  ): Observable<DailyTasksReviewResponse[]> {
    let endpoint: string = `${this.baseApiUrl}/DailyJob`;
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/daily-tasks-review.json`;
    }
    return this.httpClient.get<DailyTasksReviewResponse[]>(endpoint, {
      params: { ...params },
    });
  }
}
