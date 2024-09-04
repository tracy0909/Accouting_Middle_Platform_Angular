import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { TypeOption } from 'src/app/features/maint-rate-summary-query/models/type-option.model';
import { SearchParamsExcel } from 'src/app/features/query-cnlendback/models/search-params-excel.model';
import { ExcelTableList } from 'src/app/shared/models/excel.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { Option } from 'src/app/shared/models/option.model';
import { HistCashDivQueryService } from '../../services/hist-cash-div-query.service';
import { DatePipe } from '@angular/common';
import { SearchParams } from '../../models/search-params.model';
import { DivamtDetail } from '../../models/divamt-detail.model';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
@Component({
  selector: 'app-hist-cash-div-query',
  templateUrl: './hist-cash-div-query.component.html',
  styleUrls: ['./hist-cash-div-query.component.scss'],
})
export class HistCashDivQueryComponent extends BaseComponent {
  expendRows: any = [];
  isDetail: boolean = true;
  summaryInformation = {
    divcount: '',
    baseqty: '',
    divamt: '',
  };
  @ViewChild('tableComponent') tableComponent!: Table; // 表格組件
  @ViewChild('tableDetailComponent') tableDetailComponent!: Table; // 表格組件
  typeOptions!: TypeOption[];
  visible: boolean = false;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '歷史已領現金股利查詢'; // 頁面標題名稱
  divamtDetails: DivamtDetail[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  /** 紀錄下載查詢條件 */
  searchParams!: SearchParams;
  get tableColumns(): TableColumn[] {
    return this.isDetail
      ? [
          {
            header: '筆數',
            field: 'no',
            sortable: false,
            numberField: true,
          },
          {
            header: '發放日',
            field: 'paydt',
            sortable: false,
            dateField: true,
          },
          {
            header: '股票代號',
            field: 'stock',
            sortable: false,
          },
          {
            header: '股票名稱',
            field: 'stockname',
            sortable: false,
          },
          {
            header: '除息前一交易日',
            field: 'preexdivdt',
            sortable: false,
            dateField: true,
          },
          {
            header: '除息交易日',
            field: 'exdivdt',
            sortable: false,
            dateField: true,
          },
          {
            header: '現金股利(元/股)',
            field: 'divunit',
            sortable: false,
            numberField: true,
          },
          {
            header: '除息前一日庫存股數',
            field: 'baseqty',
            sortable: false,
            numberField: true,
          },
          {
            header: '配息金額',
            field: 'divamt',
            sortable: false,
            numberField: true,
          },
        ]
      : [
          {
            header: '筆數',
            field: 'no',
            sortable: false,
          },
          {
            header: '股票代號',
            field: 'stock',
            sortable: false,
          },
          {
            header: '股票名稱',
            field: 'stockname',
            sortable: false,
          },
          {
            header: '配息金額',
            field: 'divamt',
            sortable: false,
            numberField: true,
          },
        ];
  }

  get lendDetailTableColumns(): TableColumn[] {
    return this.isDetail
      ? [
          {
            header: '交易別',
            field: 'ttypename',
            sortable: false,
          },
          {
            header: '除息前一日庫存股數',
            field: 'baseqty',
            sortable: false,
            numberField: true,
          },
          {
            header: '配息金額',
            field: 'divamt',
            sortable: false,
            numberField: true,
          },
        ]
      : [
          {
            header: '交易別',
            field: 'ttypename',
            sortable: false,
          },
          {
            header: '配息金額',
            field: 'divamt',
            sortable: false,
            numberField: true,
          },
        ];
  }

  constructor(
    private datePipe: DatePipe,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
    private histCashDivQueryService: HistCashDivQueryService,
    private stockSuggestionsService: StockSuggestionsService,
  ) {
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
      APISERVER: ['', Validators.required],
      bhno: ['', Validators.required],
      cseq: ['', Validators.required],
      stock: [''],
      stockName: [''],
      type: [''],
      bdate: [''],
      edate: [''],
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }

    this.formGroup.get('stockName')?.disable();
  }

  onSearch(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.divamtDetails = [];
    this.expendRows = [];
    this.summaryInformation.divcount = '';
    this.summaryInformation.baseqty = '';
    this.summaryInformation.divamt = '';
    const { bdate, edate, stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      type: this.formGroup.get('type')?.getRawValue().value,
      bdate: this.datePipe.transform(bdate, 'yyyyMMdd') ?? '',
      edate: this.datePipe.transform(edate, 'yyyyMMdd') ?? '',
      stock: this.stockSuggestionsService.getStockValue(stock),
    };
    this.setDefaultParams(this.searchParams);
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify(this.searchParams),
    };
    this.addUserLogsService.addUserLog(log);
    this.isDetail = this.formGroup.get('type')?.getRawValue().value == '1';
    this.loadingMaskService.show();
    this.histCashDivQueryService.getKeepRate(this.searchParams).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (typeof response !== 'string' && Array.isArray(response.details)) {
          this.divamtDetails = this.transColumnValue(response.details);
          this.summaryInformation.divcount = response.root[0].divcount;
          this.summaryInformation.baseqty = response.root[0].baseqty;
          this.summaryInformation.divamt = response.root[0].divamt;
          this.hasSearched = true; // 設置為已查詢
        } else {
          this.systemMessageService.error(response as string);
        }
        this.loadingMaskService.hide();
        this.isSortable();
      },
      error: (error) => {
        this.divamtDetails = [];
        this.expendRows = [];
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
    this.optionService.getAPIServerOptions().subscribe({
      next: (options) => {
        this.options = options;
      },
    });
    this.typeOptions = [
      { typeName: '明細', value: '1' },
      { typeName: '彙總', value: '2' },
    ];
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.divamtDetails = []; // 清除 table
    this.expendRows = [];
    this.summaryInformation.divcount = '';
    this.summaryInformation.baseqty = '';
    this.summaryInformation.divamt = '';
    this.isDetail = true;
    this.hasSearched = false;
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.setFormValue();
    this.queryTime = '';
    this.isSortable();
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
    const { bhno, cseq } = this.searchParams;
    return `${this.titleName}_${bhno}_${cseq}`;
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  get typeValue(): string {
    return this.formGroup.get('type')?.getRawValue().value;
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  private getSearchParams(): SearchParamsExcel {
    // 查詢條件
    const paramHeadr = [
      '查詢帳中API主機',
      '分公司',
      '客戶帳號',
      '股票代碼',
      '股票名稱',
      '顯示模式',
    ];
    // 查詢條件資料
    const { APISERVER, bhno, cseq, stock, stockName, type } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stockName || '',
      type == '1' ? '明細' : '彙總',
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const exportData = this.divamtDetails.map((divamtDetail, index) => {
      const stringArr = this.isDetail
        ? [
            divamtDetail.no,
            divamtDetail.paydt,
            divamtDetail.stock,
            divamtDetail.stockname,
            divamtDetail.preexdivdt,
            divamtDetail.exdivdt,
            divamtDetail.divunit,
            divamtDetail.baseqty,
            divamtDetail.divamt,
          ]
        : [
            divamtDetail.no,
            divamtDetail.stock,
            divamtDetail.stockname,
            divamtDetail.divamt,
          ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }

  // 設定表單日期初始值的方法
  private setFormValue(): void {
    this.formGroup.get('type')?.setValue(this.typeOptions[0]);
    const today = new Date(); // 取得目前日期
    const threeMonthsPrior = new Date(today.setMonth(today.getMonth() - 3)); // 取得目前日期的前三個月日期
    this.formGroup.get('edate')?.setValue(new Date()); // 將表單中的結束日期設為目前日期
    this.formGroup.get('bdate')?.setValue(threeMonthsPrior); // 將表單中的開始日期設為前三個月日期
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
    const isSort = this.divamtDetails.length > 2;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    this.tableComponent?.reset();
    this.tableDetailComponent?.reset();
  }

  getDetailData(data: DivamtDetail[]) {
    return Array.isArray(data) ? data : [data];
  }
}
