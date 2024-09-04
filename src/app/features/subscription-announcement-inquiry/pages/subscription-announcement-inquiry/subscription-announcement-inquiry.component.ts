import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { ExcelTableList, SearchParam } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { Params } from '../../models/get-offer-details-params.model';
import { offerDetail } from '../../models/subscription-announcement-inquiry.model';
import { SubscriptionAnnouncementInquiryService } from '../../services/subscription-announcement-inquiry.service';

@Component({
  selector: 'app-subscription-announcement-inquiry',
  templateUrl: './subscription-announcement-inquiry.component.html',
  styleUrls: ['./subscription-announcement-inquiry.component.scss'],
})
export class SubscriptionAnnouncementInquiryComponent extends BaseComponent {
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  @ViewChild('offerTable') offerTable!: Table; // 表格對象，用於訪問表格實例
  readonly titleName = '申購公告查詢'; // 頁面標題名稱
  offerDetails: offerDetail[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料

  tableColumns: TableColumn[] = [
    { header: '筆數', field: 'no', numberField: true },
    { header: '股票代碼', field: 'stock', sortable: false },
    { header: '股票名稱', field: 'stocknm', sortable: false },
    {
      header: '申購起始日期',
      field: 'begindate',
      sortable: false,
      dateField: true,
    },
    {
      header: '申購迄止日期',
      field: 'enddate',
      sortable: false,
      dateField: true,
    },
    {
      header: '公開抽籤日期',
      field: 'lotdate',
      sortable: false,
      dateField: true,
    },
    { header: '撥劵日期', field: 'stkdate', sortable: false, dateField: true },
    { header: '每股價格', field: 'price', sortable: false, numberField: true },
    { header: '申購股數', field: 'qty', sortable: false, numberField: true },
    { header: '申購金額', field: 'appamt', sortable: false, numberField: true },
    { header: '更新日期', field: 'moddate', sortable: false, dateField: true },
    {
      header: '更新時間',
      field: 'modtime',
      sortable: false,
      customField: true,
    },
    { header: '取消註記', field: 'cflag' },
  ];

  /** 紀錄下載查詢條件 */
  searchParams!: Params;

  constructor(
    private subscriptionAnnouncementInquiryService: SubscriptionAnnouncementInquiryService,
    private datePipe: DatePipe,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
    private stockSuggestionsService: StockSuggestionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.setFormValue();
    this.setOptions(); // 初始化下拉式選單
    this.buttonList = this.authButtonList;
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      APISERVER: ['', Validators.required],
      bdate: ['', [Validators.required]],
      edate: ['', [Validators.required]],
      stkdate: [''],
      stock: ['', [Validators.maxLength(4)]],
      stockName: [''],
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }

    this.formGroup.get('stockName')?.disable();
  }

  private setFormValue(): void {
    const today = new Date();
    const threeMonthsPrior = new Date(today.setMonth(today.getMonth() - 3));
    this.formGroup.get('edate')?.setValue(new Date());
    this.formGroup.get('bdate')?.setValue(threeMonthsPrior);
  }

  onSearch(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.offerDetails = [];
    const { bdate, edate, stkdate, stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      bdate: this.datePipe.transform(bdate, 'yyyyMMdd') ?? '', //20240314
      edate: this.datePipe.transform(edate, 'yyyyMMdd') ?? '', //20240318
      stkdate: this.datePipe.transform(stkdate, 'yyyyMMdd') ?? '', //20240318
      stock: this.stockSuggestionsService.getStockValue(stock),
      cflag: '',
      urls: true,
      httpsUrls: true,
    };
    this.setDefaultParams(this.searchParams);
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify(this.searchParams),
    };
    this.addUserLogsService.addUserLog(log);
    this.loadingMaskService.show();
    this.subscriptionAnnouncementInquiryService
      .getOfferDetails(this.searchParams)
      .subscribe({
        next: (response) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          if (Array.isArray(response)) {
            this.offerDetails = this.transColumnValue(response);
            this.isSortable();
            this.offerTable.reset();
            this.hasSearched = true;
          } else {
            this.systemMessageService.error(response);
          }
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.offerDetails = [];
          this.loadingMaskService.hide();
        },
      });
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.offerDetails = []; // 清除 table
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    this.isSortable(); // 移除排序
    this.hasSearched = false;
    this.formGroup.get('APISERVER')?.setValue(this.options[0].value);
    this.queryTime = '';
  }

  // 為 any 原因是因為回傳的資料確定，但因為要使用[變數]所侷限故使用 any
  private transColumnValue(res: any[]): offerDetail[] {
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

  // 匯出 excel
  doExportToExcel(): void {
    const exportData = {
      param: this.getSearchParams(),
      tableList: this.getExcelTableList(),
    };
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.DOWNLOAD,
      UserId: this.userAccount,
      Remark: JSON.stringify(this.searchParams),
    };
    this.addUserLogsService.addUserLog(log);
    this.excelExportService.exportToExcel(
      exportData,
      this.getExportFileName,
      true,
    );
  }

  get getExportFileName(): string {
    const { stock } = this.searchParams;
    if (stock) {
      return `${this.titleName}_${stock}`;
    }
    return `${this.titleName}`;
  }

  private getSearchParams(): SearchParam {
    // 查詢條件
    const paramHeadr = [
      '查詢帳中API主機',
      '申購起始日 (起)',
      '申購起始日 (迄)',
      '撥劵日期',
      '股票代碼',
      '股票名稱',
    ];
    // 查詢條件資料
    const { APISERVER, bdate, edate, stkdate, stock, stockName } =
      this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.tranferColumnService.dateChange(bdate),
      this.tranferColumnService.dateChange(edate),
      this.tranferColumnService.dateChange(stkdate),
      stock || '',
      stockName || '',
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const exportData = this.offerDetails.map((offerDetail, index) => {
      const stringArr = [
        index + 1,
        offerDetail.stock,
        offerDetail.stocknm,
        offerDetail.begindate,
        offerDetail.enddate,
        offerDetail.lotdate,
        offerDetail.stkdate,
        offerDetail.price,
        offerDetail.qty,
        offerDetail.appamt,
        offerDetail.moddate,
        offerDetail.modtime,
        offerDetail.cflag,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.offerDetails.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.offerTable) {
      this.offerTable.reset();
    }
  }

  /**
   * 設置動態下拉選單的 Options 資料
   */
  setOptions(): void {
    this.optionService.getAPIServerOptions().subscribe({
      next: (options) => {
        this.options = options;
      },
    });
  }

  // 提示錯誤訊息
  showErrorMessage(name: string): string {
    let formControl = this.formGroup.get(name);
    let errorMessage: string = '';
    if (formControl?.valid) {
      errorMessage = '';
    } else if (formControl?.errors?.['required']) {
      errorMessage = `此欄位必須輸入`;
    }
    return errorMessage;
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
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
}
