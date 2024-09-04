import { Component, ViewChild } from '@angular/core';
import { TableColumn } from 'src/app/base/models/table-column.model';
import {
  SystemMarketStatusResponse,
  SystemMarketStatusTableData,
} from '../models/system-market-status.model';
import { PreMarketCheckService } from '../services/pre-market-check.service';
import { Table } from 'primeng/table';
import { DiskStatusOfServerTableData } from '../models/disk-status-of-server.model';
import { DiskStatusOfAPTableData } from '../models/disk-status-of-ap.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';

@Component({
  selector: 'app-pre-market-check',
  templateUrl: './pre-market-check.component.html',
  styleUrls: ['./pre-market-check.component.scss'],
})
export class PreMarketCheckComponent extends BaseComponent {
  // 頁面各標題名稱
  readonly systemMarketStatusTableName = '系統投資市場狀態';
  readonly diskStatusOfServerTableName = '各主機硬碟資訊狀態表';
  readonly diskStatusOfAPTableName = '各主機AP資訊狀態表';
  @ViewChild('systemMarketStatusTable') systemMarketStatusTable!: Table;
  @ViewChild('diskStatusOfServerTable') diskStatusOfServerTable!: Table;
  @ViewChild('diskStatusOfAPTable') diskStatusOfAPTable!: Table;

  // 表格資料陣列
  tableData: SystemMarketStatusResponse[] = [];
  systemMarketStatusTableData: SystemMarketStatusTableData[] = [];
  diskStatusOfServerTableData: DiskStatusOfServerTableData[] = [];
  diskStatusOfAPTableData: DiskStatusOfAPTableData[] = [];

  // 表格的欄位設定
  systemMarketStatusTableColumns: TableColumn[] = [];
  diskStatusOfServerTableColumns: TableColumn[] = [];
  diskStatusOfAPTableColumns: TableColumn[] = [];

  // 資料查詢時間
  queryTime: string | null = null;

  constructor(
    private preMarketCheckService: PreMarketCheckService,
    private addUserLogsService: AddUserLogsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initTableColumns();
    this.doQuery();
  }

  // 初始化表格
  private initTableColumns(): void {
    this.systemMarketStatusTableColumns = [
      {
        header: '機房',
        field: 'DBName',
        sortable: false,
      },
      {
        header: '市場代碼',
        field: 'InvtCode',
        sortable: false,
      },
      {
        header: '中文名稱',
        field: 'CName',
        sortable: false,
      },
      {
        header: '系統交易日',
        field: 'TDate',
        sortable: false,
      },
      {
        header: '交易開始時間',
        field: 'StartTime',
        sortable: false,
      },
      {
        header: '交易結束時間',
        field: 'EndTime',
        sortable: false,
      },
    ];
    this.diskStatusOfServerTableColumns = [
      {
        header: '機房',
        field: '',
        sortable: false,
      },
      {
        header: 'IP',
        field: '',
        sortable: false,
      },
      {
        header: '主機名稱',
        field: '',
        sortable: false,
      },
      {
        header: '硬碟名稱',
        field: '',
        sortable: false,
      },
      {
        header: '容量',
        field: '',
        sortable: false,
      },
      {
        header: '已使用空間',
        field: '',
        sortable: false,
      },
      {
        header: '使用率',
        field: '',
        sortable: false,
        numberField: true,
      },
      {
        header: '安全性',
        field: '',
        sortable: false,
      },
      {
        header: '狀態更新日期',
        field: '',
        sortable: false,
      },
      {
        header: '狀態更新時間',
        field: '',
        sortable: false,
      },
    ];
    this.diskStatusOfAPTableColumns = [
      {
        header: '機房',
        field: '',
        sortable: false,
      },
      {
        header: 'IP',
        field: '',
        sortable: false,
      },
      {
        header: 'AP名稱',
        field: '',
        sortable: false,
      },
      {
        header: 'AP路徑',
        field: '',
        sortable: false,
        numberField: true,
      },
      {
        header: '狀態',
        field: '',
        sortable: false,
      },
      {
        header: '狀態更新日期',
        field: '',
        sortable: false,
      },
      {
        header: '狀態更新時間',
        field: '',
        sortable: false,
      },
    ];
  }

  doQuery() {
    // 查詢前先清空 table
    this.systemMarketStatusTableData = [];
    this.diskStatusOfServerTableData = [];
    this.diskStatusOfAPTableData = [];
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify({}),
    };
    this.addUserLogsService.addUserLog(log);
    this.loadingMaskService.show();

    // 系統投資市場狀態
    this.preMarketCheckService.getMarketStatusData().subscribe({
      next: (response) => {
        // 資料查詢時間
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (response) {
          this.systemMarketStatusTableData = response.map((item) => {
            const { TDate, StartTime, EndTime } = item;
            return {
              ...item,
              TDate: this.tranferColumnService.dateChange(TDate),
              StartTime: this.tranferColumnService
                .timeChange(StartTime)
                .replace(/:$/, ''),
              EndTime: this.tranferColumnService
                .timeChange(EndTime)
                .replace(/:$/, ''),
            };
          });
          // console.log(response);
          this.isSortable();
        } else {
          this.systemMarketStatusTableData = [];
          this.systemMessageService.error(response);
        }
        this.loadingMaskService.hide();
      },
      error: (error) => {
        this.systemMarketStatusTableData = [];
        this.loadingMaskService.hide();
      },
    });

    // 各主機硬碟資訊狀態表
    this.preMarketCheckService.getDiskStatusOfServerData().subscribe({
      next: (response) => {
        if (response) {
          this.diskStatusOfServerTableData = response.map((item) => {
            const { ModDate, ModTime } = item;
            return {
              ...item,
              ModDate: this.tranferColumnService.dateChange(ModDate),
              ModTime: this.tranferColumnService.timeChange(ModTime),
            };
          });
          // console.log(this.diskStatusOfServerTableData);
          this.isSortable();
        } else {
          this.diskStatusOfServerTableData = [];
          this.systemMessageService.error(response);
        }
        this.loadingMaskService.hide();
      },
      error: (error) => {
        this.diskStatusOfServerTableData = [];
        this.loadingMaskService.hide();
      },
    });

    // 各主機AP資訊狀態表
    this.preMarketCheckService.getDiskStatusOAPData().subscribe({
      next: (response) => {
        if (response) {
          this.diskStatusOfAPTableData = response.map((item) => {
            const { ModDate, ModTime } = item;
            return {
              ...item,
              ModDate: this.tranferColumnService.dateChange(ModDate),
              ModTime: this.tranferColumnService.timeChange(ModTime),
            };
          });
          // console.log(this.diskStatusOfAPTableData);
          this.isSortable();
        } else {
          this.diskStatusOfAPTableData = [];
          this.systemMessageService.error(response);
        }
        this.loadingMaskService.hide();
      },
      error: (error) => {
        this.diskStatusOfAPTableData = [];
        this.loadingMaskService.hide();
      },
    });
  }

  // // 暫保留，因元件不支援特定表格顯示，可能會用到
  // getHostNameDickNumber(hostName: any): number {
  //   let hostNameList = this.diskStatusOfServerTableData.filter(
  //     (item) => item.HostName === hostName,
  //   );
  //   let obj: any = {};
  //   hostNameList.forEach((item) => {
  //     if (!obj[item.DiskName]) {
  //       obj[item.DiskName] = 1;
  //     }
  //   });
  //   // console.log(Object.keys(obj).length);
  //   return Object.keys(obj).length;
  // }

  // // 暫保留，因元件不支援特定表格顯示，可能會用到
  // getRowSpanFromDiskList(tableIndex: number, diskListIndex: number): number {
  //   const diskListLength =
  //     this.diskStatusOfServerTableData[tableIndex].Computer_list[diskListIndex]
  //       .Disk_list.length;
  //   // console.log(diskListLength);

  //   return diskListLength;
  // }

  // 資料只有單筆的話，取消排序
  isSortable(): void {
    const isSort = this.systemMarketStatusTableData.length > 1;
    this.systemMarketStatusTableColumns.map(
      (column) => (column.sortable = isSort),
    );
    // console.log(isSort, this.systemMarketStatusTableColumns);

    if (this.systemMarketStatusTable) {
      this.systemMarketStatusTable.reset();
    }
  }
}
