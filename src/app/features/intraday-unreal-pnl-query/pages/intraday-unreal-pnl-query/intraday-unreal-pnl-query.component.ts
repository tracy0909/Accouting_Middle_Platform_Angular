import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table, TableRowExpandEvent } from 'primeng/table';
import { concatMap } from 'rxjs';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { SearchParamsExcel } from 'src/app/features/query-cnlendback/models/search-params-excel.model';
import { ExchangeRateOption } from 'src/app/features/unreal-pnl-total-query/models/exchange-rate-option.model';
import { ExcelTableList } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { SearchParams } from '../../models/search-params.model';
import { UnrealSumDetail } from '../../models/unreal-sum-detail.model';
import { UnrealSum } from '../../models/unreal-sum.model';
import { IntradayUnrealPnlQueryService } from '../../services/intraday-unreal-pnl-query.service';
@Component({
  selector: 'app-intraday-unreal-pnl-query',
  templateUrl: './intraday-unreal-pnl-query.component.html',
  styleUrls: ['./intraday-unreal-pnl-query.component.scss'],
})
export class IntradayUnrealPnlQueryComponent extends BaseComponent {
  settleStatus: string = '';
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  expendRows: any = [];
  currencyOptions: Option[] = []; // 動態下拉選單的 Options 資料
  exchangeRateOptions: ExchangeRateOption[] = [];
  @ViewChild('tableCopmonent') tableCopmonent!: Table; // 表格組件
  visible: boolean = false;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '現股當沖未實現損益查詢'; // 頁面標題名稱
  unrealDetails: UnrealSumDetail[] = [];
  unrealSums: UnrealSum[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  /** 紀錄下載查詢條件 */
  lastSearchParams!: SearchParams;
  searchParams!: SearchParams;
  tableColumns: TableColumn[] = [
    {
      header: '筆數',
      field: 'no',
      sortable: false,
      numberField: true,
    },
    {
      header: '庫存類別',
      field: 'ttypename',
      sortable: false,
    },
    {
      header: '股票代碼',
      field: 'stock',
      sortable: false,
    },
    {
      header: '股票名稱',
      field: 'stocknm',
      sortable: false,
    },
    {
      header: '買未沖',
      field: 'bqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '賣未沖',
      field: 'sqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益兩平試算',
      field: 'breakeven',
      sortable: false,
      numberField: true,
    },
    {
      header: '買進成本',
      field: 'bcost',
      sortable: false,
      numberField: true,
    },
    {
      header: '賣出收入',
      field: 'scost',
      sortable: false,
      numberField: true,
    },
    {
      header: '成本均價',
      field: 'avgprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '預估賣出收入',
      field: 'snetamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '預估買進成本',
      field: 'bnetamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '現價',
      field: 'lastprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '漲跌',
      field: 'AD',
      sortable: false,
      numberField: true,
    },
    {
      header: '漲跌幅',
      field: 'ADR',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'unreal',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'urratio',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  lendDetailTableColumns: TableColumn[] = [
    {
      header: '成交日',
      field: 'tdate',
      sortable: false,
      dateField: true,
    },
    {
      header: '交易別',
      field: 'ttypename',
      sortable: false,
    },
    {
      header: '股票代碼',
      field: 'stock',
      sortable: false,
    },
    {
      header: '股票名稱',
      field: 'stockname',
      sortable: false,
    },
    {
      header: '數量',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '單價',
      field: 'price',
      sortable: false,
      numberField: true,
    },
    {
      header: '價金',
      field: 'amt',
      sortable: false,
      numberField: true,
    },
    {
      header: '原幣買進成本',
      field: 'bcost',
      sortable: false,
      numberField: true,
    },
    {
      header: '原幣賣出收入',
      field: 'scost',
      sortable: false,
      numberField: true,
    },
    {
      header: '原幣預估賣出收入',
      field: 'snetamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '原幣預估買進成本',
      field: 'bnetamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '原幣損益試算',
      field: 'unreal',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益兩平試算',
      field: 'breakeven',
      sortable: false,
      numberField: true,
    },
    {
      header: '手續費',
      field: 'fee',
      sortable: false,
      numberField: true,
    },
    {
      header: '交易稅',
      field: 'tax',
      sortable: false,
      numberField: true,
    },
    {
      header: '委託單號',
      field: 'dseq',
      sortable: false,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  summaryTableColumns: TableColumn[] = [
    {
      header: '買未沖',
      field: 'bqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '賣未沖',
      field: 'sqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '買進成本',
      field: 'bcost',
      sortable: false,
      numberField: true,
    },
    {
      header: '賣出收入',
      field: 'scost',
      sortable: false,
      numberField: true,
    },
    {
      header: '預估賣出收入',
      field: 'snetamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '預估買進成本',
      field: 'bnetamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'unreal',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'urratio',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
    private intradayUnrealPnlQueryService: IntradayUnrealPnlQueryService,
    private stockSuggestionsService: StockSuggestionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.buttonList = this.authButtonList;
    this.setOptions(); // 初始化下拉式選單
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      APISERVER: ['', Validators.required],
      cseq: ['', Validators.required],
      bhno: ['', Validators.required],
      stock: [''],
      stockName: [''],
      ctype: [''],
      exchangeRate: [''],
      checkbox1: [''],
      checkbox2: [''],
      checkbox3: [''],
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
    this.unrealSums = [];
    this.expendRows = [];
    this.settleStatus = '';
    const { stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      ctype: this.formGroup.get('ctype')?.getRawValue(),
      ttype: '0',
      exchangeRate: this.formGroup.get('exchangeRate')?.getRawValue().rate,
      stock: this.stockSuggestionsService.getStockValue(stock),
    };
    this.setDefaultParams(this.searchParams);
    this.lastSearchParams = this.searchParams;
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify(this.searchParams),
    };
    this.addUserLogsService.addUserLog(log);
    this.loadingMaskService.show();
    this.intradayUnrealPnlQueryService
      .getKeepRate(this.searchParams)
      .subscribe({
        next: (response) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          if (typeof response !== 'string' && Array.isArray(response.data)) {
            this.unrealSums = this.transColumnValue(response.data);
            this.settleStatus = response.status;
            this.hasSearched = true; // 設置為已查詢
          } else {
            this.systemMessageService.error(response as string);
          }
          this.loadingMaskService.hide();
          this.isSortable();
        },
        error: (error) => {
          this.unrealSums = [];
          this.loadingMaskService.hide();
        },
      });
  }

  onSearchDetails(): void {
    this.unrealDetails = [];
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify(this.lastSearchParams),
    };
    this.addUserLogsService.addUserLog(log);
    this.loadingMaskService.show();
    this.intradayUnrealPnlQueryService
      .getDetails(this.lastSearchParams)
      .subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.unrealDetails = this.transColumnValue(response);
            this.hasSearched = true; // 設置為已查詢
          } else {
            this.systemMessageService.error(response);
          }
          this.loadingMaskService.hide();
          this.isSortable();
        },
        error: (error) => {
          this.unrealDetails = [];
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
    this.optionService
      .getAPIServerOptions()
      .pipe(
        concatMap((options) => {
          this.options = options;
          const searchParams = {
            sid: 'ad',
            sip: this.getUserIP,
            Invscode: 'TWSE',
            comp: '551',
            APISERVER: this.options[0].value,
          };
          this.loadingMaskService.show();
          return this.optionService.getExchangeRate(searchParams);
        }),
      )
      .subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.exchangeRateOptions = response.filter(
              (option) => option.label !== 'USD',
            );
            this.formGroup
              .get('exchangeRate')
              ?.setValue(this.exchangeRateOptions[0]);
          } else {
            this.systemMessageService.error(response);
          }
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.loadingMaskService.hide();
        },
      });
    this.optionService.getCurrencyOptions().subscribe({
      next: (currencyOptions) => {
        this.currencyOptions = currencyOptions;
        // 將選項資料轉換為字符串並記錄日誌
        if (this.currencyOptions.length > 0) {
          this.formGroup.patchValue({ ctype: this.currencyOptions[0].value }); // 預設分公司為第一筆
        }
      },
    });
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.unrealSums = []; // 清除 table
    this.unrealDetails = [];
    this.expendRows = [];
    this.hasSearched = false;
    this.formGroup.patchValue({
      bhno: this.branchOptions[0].value,
      exchangeRate: this.exchangeRateOptions[0],
      ctype: this.currencyOptions[0].value,
    });
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.queryTime = '';
    this.isSortable();
    this.settleStatus = '';
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

  get exchangeRateControl(): FormControl {
    return this.formGroup.get('exchangeRate') as FormControl;
  }

  get redInfo(): string {
    return `:${this.exchangeRateControl?.getRawValue().rate}(匯率日期:${
      this.exchangeRateControl?.getRawValue().tdate
    })`;
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getCurrency(value: string): string {
    const currency = this.currencyOptions.find((opt) => opt.value === value);
    return currency ? currency.label : value;
  }

  private getExchangeRate(rate: string): string {
    const exchangerate = this.exchangeRateOptions.find(
      (opt) => opt.rate === rate,
    );
    return exchangerate ? exchangerate.label : rate;
  }

  private getSearchParams(): SearchParamsExcel {
    // 查詢條件
    const paramHeadr = [
      '查詢帳中API主機',
      '分公司',
      '客戶帳號',
      '股票代碼',
      '股票名稱',
      '幣別',
      '參考匯率',
    ];
    // 查詢條件資料
    const { APISERVER, bhno, cseq, stock, stockName, ctype, exchangeRate } =
      this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      bhno || '',
      cseq || '',
      stock || '',
      stockName || '',
      this.getCurrency(ctype),
      this.getExchangeRate(exchangeRate),
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const exportData = this.unrealSums.map((unrealSum, index) => {
      const stringArr = [
        unrealSum.no,
        unrealSum.ttypename,
        unrealSum.stock,
        unrealSum.stocknm,
        unrealSum.bqty,
        unrealSum.sqty,
        unrealSum.breakeven,
        unrealSum.bcost,
        unrealSum.scost,
        unrealSum.avgprice,
        unrealSum.snetamt,
        unrealSum.bnetamt,
        unrealSum.lastprice,
        unrealSum.AD,
        unrealSum.ADR,
        unrealSum.unreal,
        unrealSum.urratio,
        unrealSum.currnm,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
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
    const isSort = this.unrealSums.length > 2;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    const isDetailSort = this.unrealSums.some(
      (item) => this.getDetailData(item).length > 1,
    );

    this.lendDetailTableColumns.map(
      (column) => (column.sortable = isDetailSort),
    );
    console.log(isDetailSort, this.tableColumns);

    if (this.tableCopmonent) {
      this.tableCopmonent.reset();
    }
  }

  get FilterData(): UnrealSum[] {
    return this.unrealSums.filter((item) => item.no !== '合計');
  }
  get FilterTotalData(): UnrealSum[] {
    return this.unrealSums.filter((item) => item.no === '合計');
  }

  onRowExpand(event: TableRowExpandEvent): void {
    if (this.unrealDetails.length == 0) {
      this.onSearchDetails();
    }
  }

  getDetailDate(data: string) {
    return this.tranferColumnService.dateChange(data);
  }

  getDetailData(rowData: UnrealSum) {
    if (this.unrealDetails.length === 0) {
      return [];
    }
    const detail =
      this.unrealDetails[Number(rowData.no) - 1].cntd_unreal_detail;

    return Array.isArray(detail) ? detail : [detail];
  }
}
