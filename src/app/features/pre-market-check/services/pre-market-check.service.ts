import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { map, Observable } from 'rxjs';
import {
  SystemMarketStatusResponse,
  SystemMarketStatusTableData,
} from '../models/system-market-status.model';
import {
  DiskStatusOfServerResponse,
  DiskStatusOfServerTableData,
} from '../models/disk-status-of-server.model';
import {
  DiskStatusOfApResponse,
  DiskStatusOfAPTableData,
} from '../models/disk-status-of-ap.model';

@Injectable({
  providedIn: 'root',
})
export class PreMarketCheckService {
  baseApiUrl = environment.apiEndpoint;

  constructor(private httpClient: HttpClient) {}

  // 系統投資市場狀態
  getMarketStatusData(): Observable<SystemMarketStatusTableData[]> {
    let endpoint: string = `${this.baseApiUrl}/MarketStatus`;
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/pre-market-check.json`;
    }
    return this.httpClient.get<SystemMarketStatusResponse[]>(endpoint).pipe(
      map((response) =>
        response.flatMap(({ DBName, MARKET_list = [] }) =>
          MARKET_list.length > 0
            ? MARKET_list.map((market) => ({ DBName, ...market }))
            : [
                {
                  DBName,
                  InvtCode: '',
                  CName: '',
                  TDate: '',
                  StartTime: '',
                  EndTime: '',
                },
              ],
        ),
      ),
    );
  }

  // 各主機硬碟資訊狀態表
  getDiskStatusOfServerData(): Observable<DiskStatusOfServerTableData[]> {
    let endpoint: string = `${this.baseApiUrl}/MonitorSystem`;
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/disk-status-of-server.json`;
    }

    return this.httpClient
      .get<DiskStatusOfServerResponse[]>(endpoint)
      .pipe(map((response) => this.flattenDiskStatusOfServer(response)));
  }

  private flattenDiskStatusOfServer(
    data: DiskStatusOfServerResponse[],
  ): DiskStatusOfServerTableData[] {
    return data.flatMap((db) =>
      db.Computer_list.flatMap((computer) =>
        computer.Disk_list.map((disk) => ({
          DBIp: db.DBIp,
          DBName: db.DBName,
          IPAddress: computer.IPAddress,
          HostName: computer.HostName,
          DiskName: disk.DiskName,
          DiskCapacity: disk.DiskCapacity,
          DiskUsedSpace: disk.DiskUsedSpace,
          DiskUsage: disk.DiskUsage,
          IsSecure: disk.IsSecure,
          ModDate: disk.ModDate,
          ModTime: disk.ModTime,
        })),
      ),
    );
  }

  // 各主機AP資訊狀態表
  getDiskStatusOAPData(): Observable<DiskStatusOfAPTableData[]> {
    let endpoint: string = `${this.baseApiUrl}/MonitorAP`;
    if (environment.apiMock) {
      endpoint = `assets/mock/api/v1/json-file/disk-status-of-ap.json`;
    }
    return this.httpClient
      .get<DiskStatusOfApResponse[]>(endpoint)
      .pipe(map((response) => this.flattenDiskStatusOfAp(response)));
  }

  private flattenDiskStatusOfAp(
    data: DiskStatusOfApResponse[],
  ): DiskStatusOfAPTableData[] {
    return data.flatMap((db) =>
      db.IP_list.flatMap((ip) =>
        ip.AP_list.map((ap) => ({
          DBIp: db.DBIp,
          DBName: db.DBName,
          AppName: ap.AppName,
          AppPath: ap.AppPath,
          ProcessStatus: ap.ProcessStatus,
          ModDate: ap.ModDate,
          ModTime: ap.ModTime,
        })),
      ),
    );
  }
}
