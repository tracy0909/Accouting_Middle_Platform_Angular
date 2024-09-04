import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { TransferMonitorService } from '../../services/transfer-monitor.service';
import { ConversionMonitoring } from '../../models/conversion-monitoring.model';
import { SearchParams } from '../../models/search-params.model';
import { TransferMonitorEnum } from '../../enum/transfer-monitor.enum';
@Component({
  selector: 'app-transfer-monitor',
  templateUrl: './transfer-monitor.component.html',
  styleUrls: ['./transfer-monitor.component.scss'],
})
export class TransferMonitorComponent extends BaseComponent {
  @ViewChild('tableCopmonent') tableCopmonent!: Table; // 表格組件
  visible: boolean = false;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '轉檔監控'; // 頁面標題名稱
  conversionMonitorings: ConversionMonitoring[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  transferFileNameOptions: Option[] = [];
  trStatusOptions: Option[] = [];
  statusOptions: Option[] = [];
  /** 紀錄下載查詢條件 */
  searchParams!: SearchParams;
  tableColumns: TableColumn[] = [
    {
      header: '筆數',
      field: '',
      sortable: false,
      numberField: true,
    },
    {
      header: '公司別',
      field: 'BhName',
      sortable: false,
    },
    {
      header: '資料代號',
      field: 'FCode',
      sortable: false,
    },
    {
      header: '更改時間',
      field: 'DDate',
      sortable: false,
      dateField: true,
    },
    {
      header: '今日轉檔狀態',
      field: 'Status',
      sortable: false,
    },
    {
      header: '最近一次轉檔結果',
      field: 'TrStatus',
      sortable: false,
    },
    {
      header: '轉檔日期',
      field: 'TrDate',
      sortable: false,
      dateField: true,
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
      header: '轉檔人員',
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

  constructor(private transferMonitorService: TransferMonitorService) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.buttonList = this.authButtonList;
    this.setOptions(); // 初始化下拉式選單
    this.setFormValue();
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      DBSource: ['', [Validators.required]],
      bhno: [''],
      FCode: [''],
      TrStatus: [''],
      Status: [''],
    });
    if (this.formGroup.contains('DBSource')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
  }

  onSearch(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.conversionMonitorings = [];
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      // sid: 'ad',
      // sip: '',
      // Invscode: '',
      // comp: '551',
      DBSource: this.formGroup.get('DBSource')?.value,
      Status:
        this.formGroup.get('Status')?.value === 'A'
          ? ''
          : this.formGroup.get('Status')?.value,
      TrStatus:
        this.formGroup.get('TrStatus')?.value === 'A'
          ? ''
          : this.formGroup.get('TrStatus')?.value,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.setDefaultParams(this.searchParams);
    this.loadingMaskService.show();
    this.transferMonitorService
      .getConversionMonitoring(this.searchParams)
      .subscribe({
        next: (response) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          this.conversionMonitorings = this.transColumnValue(response);
          this.conversionMonitorings.map(
            (item) => (
              (item.TrStatus =
                item.TrStatus == 'Y'
                  ? '轉檔成功'
                  : item.TrStatus == 'E'
                  ? '轉檔失敗'
                  : '轉檔中'),
              (item.Status = item.Status == 'Y' ? '已轉' : '未轉'),
              (item.BhName = item.BhNo + ' ' + item.BhName),
              (item.TrTime = this.tranferColumnService.timeChange(item.TrTime))
            ),
          );
          this.hasSearched = true; // 設置為已查詢
          this.loadingMaskService.hide();
          this.isSortable();
        },
        error: (error) => {
          this.conversionMonitorings = [];
          this.loadingMaskService.hide();
        },
      });
  }

  // 提示錯誤訊息
  showErrorMessage(name: string): string {
    let formControl = this.formGroup.get(name);
    let errorMessage: string = '';
    if (formControl?.errors?.['required']) {
      errorMessage = `此欄位必須輸入`;
    }
    return errorMessage;
  }

  /**
   * 獲取表單控件
   * @param {string} formControlName 表單控件名稱
   * @returns {FormControl} 表單控件
   */
  formControl(formControlName: string): FormControl {
    return this.formGroup.get(formControlName) as FormControl;
  }

  /**
   * 檢查表單控件是否無效
   * @param {string} formControlName 表單控件名稱
   * @returns {boolean} 表單控件是否無效
   */
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || formControl.touched)
      : false;
  }

  setOptions(): void {
    this.optionService.branchOfficesDbSourceOptions().subscribe({
      next: (branchOptions) => {
        this.branchOptions = branchOptions;
        const { bhno, cseq } = this.getDefaultParams();
        let bhnoValue =
          !bhno && this.branchOptions.length > 0
            ? this.branchOptions[0].value
            : bhno;
        this.formGroup.patchValue({ bhno: bhnoValue, cseq });
      },
    });
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (options) => {
        this.options = options;
        // 將選項資料轉換為字符串並記錄日誌
        // console.log('setOptions data = ' + JSON.stringify(this.options));
      },
    });
    this.optionService.getTransferFileNameOptions().subscribe({
      next: (transferFileNameOptions) => {
        this.transferFileNameOptions = transferFileNameOptions;
      },
    });

    this.statusOptions = [
      {
        id: '',
        label: '全部',
        value: 'A',
      },
      {
        id: '',
        label: '轉檔',
        value: 'Y',
      },
      {
        id: '',
        label: '未轉檔',
        value: 'N',
      },
    ];

    this.trStatusOptions = [
      {
        id: '',
        label: '全部',
        value: 'A',
      },
      {
        id: '',
        label: '成功',
        value: 'Y',
      },
      {
        id: '',
        label: '失敗',
        value: 'N',
      },
    ];
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.conversionMonitorings = []; // 清除 table
    this.hasSearched = false;
    this.setFormValue();
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.queryTime = '';
    this.isSortable();
  }

  // 設定表單日期初始值的方法
  private setFormValue(): void {
    this.formGroup.get('Status')?.setValue(this.statusOptions[0].value);
    this.formGroup.get('TrStatus')?.setValue(this.trStatusOptions[0].value);
  }

  // 為 any 原因是因為回傳的資料確定，但因為要使用[變數]所侷限故使用 any
  private transColumnValue(res: any[]): any[] {
    const customerColumns = this.tableColumns
      .filter((item) => item.customField)
      .map((item) => item.field);
    const dateColumns = this.tableColumns
      .filter((item) => item.dateField)
      .map((item) => item.field);
    res.forEach((item) => {
      customerColumns.forEach((column) => {
        item[column] = this.tranferColumnService.timeChange(item[column]);
      });
      dateColumns.forEach((column) => {
        item[column] = this.tranferColumnService.dateChange(item[column]);
      });
    });
    return res;
  }

  isSortable(): void {
    const isSort = this.conversionMonitorings.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.tableCopmonent) {
      this.tableCopmonent.reset();
    }
  }

  get TransferMonitorEnum() {
    return TransferMonitorEnum;
  }
}
