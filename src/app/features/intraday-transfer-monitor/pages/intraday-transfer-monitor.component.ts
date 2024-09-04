import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Option } from '../../../shared/models/option.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { IntradayTransferMonitorService } from '../service/intraday-transfer-monitor.service';
import { Table } from 'primeng/table';
import { IntradayTransferMonitorResponse } from '../models/intraday-transfer-monitor-response.model';

@Component({
  selector: 'app-intraday-transfer-monitor',
  templateUrl: './intraday-transfer-monitor.component.html',
  styleUrls: ['./intraday-transfer-monitor.component.scss'],
})
export class IntradayTransferMonitorComponent extends BaseComponent {
  @ViewChild('tableComponent') tableComponent!: Table;
  readonly titleName = '盤中轉檔監控';
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  conversionsOptions: Option[] = []; // 動態下拉選單的 Options 資料
  buttonList!: ButtonList;
  queryTime: string | null = null; // 資料查詢時間
  tableData: IntradayTransferMonitorResponse[] = []; // 表格資料數組
  statusOptions: Option[] = [
    { id: 'A', label: '全部', value: 'A' },
    { id: 'N', label: '失敗', value: 'N' },
    { id: 'Y', label: '完成', value: 'Y' },
  ];
  tableColumns: TableColumn[] = [
    {
      header: '資料代號',
      field: 'FCode',
      numberField: true,
    },
    {
      header: '更改時間',
      field: 'FDate',
      sortable: false,
    },
    {
      header: '轉檔結果',
      field: 'TrStatus',
      sortable: false,
    },
    {
      header: '轉檔日期',
      field: 'TrDate',
      sortable: false,
    },
    {
      header: '轉檔時間',
      field: 'TrTime',
      sortable: false,
    },
    {
      header: '轉檔次數',
      field: 'Times',
      sortable: false,
      numberField: true,
    },
    {
      header: '讀取筆數',
      field: 'ReadCt',
      sortable: false,
      numberField: true,
    },
    {
      header: '新增筆數',
      field: 'NewCt',
      sortable: false,
      numberField: true,
    },
    {
      header: '更新筆數',
      field: 'OldCt',
      sortable: false,
      numberField: true,
    },
    {
      header: '刪除筆數',
      field: 'DeleteCt',
      sortable: false,
      numberField: true,
    },
    {
      header: '轉檔者',
      field: 'TrUser',
      sortable: false,
    },
    {
      header: '檔案路徑',
      field: 'FolderPath',
      sortable: false,
    },
    {
      header: '資料說明',
      field: 'Descript',
      sortable: false,
    },
  ];
  constructor(
    private intradayTransferMonitorService: IntradayTransferMonitorService,
  ) {
    super();
  }

  // 初始化方法，在元件初始化時呼叫
  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單組
    this.setOptions(); // 初始化下拉式選單
    this.buttonList = this.authButtonList;
    // 監聽 Status 欄位變化
    this.formGroup.get('Status')?.valueChanges.subscribe((value) => {
      if (value === 'N') {
        this.formGroup.get('Time')?.disable();
      } else {
        this.formGroup.get('Time')?.enable();
      }

      this.setCurrentTime();
    });
  }

  // 初始化表單
  initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      DBSource: ['', Validators.required],
      Status: ['N'],
      FCode: [''],
      Time: ['', [Validators.required, Validators.maxLength(6)]],
    });

    this.setCurrentTime();

    // 初始化時根據狀態值禁用或啟用 Time 欄位
    this.formGroup.get('Time')?.disable();
    if (this.formGroup.contains('DBSource')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
  }

  doQuery(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.tableData = []; // 表格資料數組

    const formValues = this.formGroup.value;

    if (formValues.Status === 'A') {
      formValues.Status = '';
    }

    const params = {
      ...this.formGroup.value,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.setDefaultParams(params);

    // console.log(params);
    this.loadingMaskService.show();
    this.intradayTransferMonitorService
      .getIntradayTransferMonitor(params)
      .subscribe({
        next: (response) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          this.loadingMaskService.hide();
          if (response) {
            this.tableData = response.map((item) => {
              const { FDate, TrDate, TrTime } = item;
              return {
                ...item,
                FDate: this.tranferColumnService.dateChange(FDate),
                TrDate: this.tranferColumnService.dateChange(TrDate),
                TrTime: this.tranferColumnService.timeChange(TrTime),
              };
            });
            this.isSortable();
          }
          // console.log(response);
        },
        error: (error) => {
          this.tableData = [];
          // console.log('this.tableData:', this.tableData);
          this.loadingMaskService.hide();
        },
      });
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.tableData = [];
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    this.formGroup.get('FCode')?.setValue(this.conversionsOptions[0].value);
    this.queryTime = '';
    this.setCurrentTime();
    this.isSortable();
  }

  /**
   * 設置動態下拉選單的 Options 資料
   */
  setOptions(): void {
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (options) => {
        this.options = options;
      },
    });
    this.optionService.getConversions().subscribe({
      next: (conversionsOptions) => {
        this.conversionsOptions = conversionsOptions;
        // this.formGroup.get('FCode')?.setValue(this.conversionsOptions[0].value);
      },
    });
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    if (this.tableComponent) {
      this.tableComponent.reset();
    }
  }

  setCurrentTime(): void {
    const currentTime = new Date()
      .toLocaleTimeString('zh-TW', { hour12: false })
      .replace(/:/g, '');
    this.formGroup.get('Time')?.setValue(currentTime);
  }

  // 表單的值若為空值，顯示紅框警告
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || formControl.touched)
      : false;
  }

  // 格式錯誤訊息提示
  showErrorMessage(name: string): string {
    const control = this.formGroup.get(name);
    if (control?.errors?.['required']) {
      return `此欄位必須輸入`;
    }
    return '';
  }
}
