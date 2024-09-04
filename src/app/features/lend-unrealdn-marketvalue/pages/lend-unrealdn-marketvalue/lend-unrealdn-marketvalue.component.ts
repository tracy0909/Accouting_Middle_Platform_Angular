import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { concatMap } from 'rxjs';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { ExchangeRateOption } from 'src/app/features/unreal-pnl-total-query/models/exchange-rate-option.model';
import { ExcelTableList } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { SearchParamsExcel } from '../../models/search-params-excel.model';
import { SearchParams } from '../../models/search-params.model';
import { UnrealDetail } from '../../models/unreal-detail.model';
import { UnrealSum } from '../../models/unreal-sum.model';
import { LendUnrealdnMarketvalueService } from '../../services/lend-unrealdn-marketvalue.service';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-lend-unrealdn-marketvalue',
  templateUrl: './lend-unrealdn-marketvalue.component.html',
  styleUrls: ['./lend-unrealdn-marketvalue.component.scss'],
})
export class LendUnrealdnMarketvalueComponent extends BaseComponent {
  @ViewChild('tableComponent') tableComponent!: Table;
  expendRows: any = [];
  currencyOptions: Option[] = [];
  exchangeRateOptions: ExchangeRateOption[] = [];
  visible: boolean = false;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '出借股票未實現損益查詢'; // 頁面標題名稱
  unrealSums: UnrealSum[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  /** 紀錄下載查詢條件 */
  searchParams!: SearchParams;
  tableColumns: TableColumn[] = [
    {
      header: '筆數',
      field: 'no',
      sortable: false,
      numberField: true,
    },
    {
      header: '交易類別',
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
      header: '即時出借庫',
      field: 'real_qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '昨日出借庫',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '今日還劵入',
      field: 'bqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '今日出借出',
      field: 'sqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '付出成本',
      field: 'cost',
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
      header: '現值',
      field: 'nowamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '未實現損益',
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
      header: '現價',
      field: 'lastprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '利息',
      field: 'interest',
      sortable: false,
      numberField: true,
    },
    {
      header: '除息金',
      field: 'divamt',
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
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  summaryTableColumns: TableColumn[] = [
    {
      header: '即時出借庫',
      field: 'real_qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '昨日出借庫',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '今日還劵入',
      field: 'bqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '今日出借出',
      field: 'sqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '付出成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '現值',
      field: 'nowamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '未實現損益',
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

  detailTableColumns: TableColumn[] = [
    {
      header: '交易日期',
      field: 'tdate',
      sortable: false,
      dateField: true,
    },
    {
      header: '股票代碼',
      field: 'stock',
      sortable: false,
    },
    {
      header: '交易類別',
      field: 'ttypename',
      sortable: false,
    },
    {
      header: '委託書號',
      field: 'dseq',
      sortable: false,
    },
    {
      header: '原股數',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '未償還股數',
      field: 'bqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '成交單價',
      field: 'price',
      sortable: false,
      numberField: true,
    },
    {
      header: '成交價金',
      field: 'mamt',
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
      header: '除息金額',
      field: 'divamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '利息',
      field: 'interest',
      sortable: false,
      numberField: true,
    },
    {
      header: '原幣付出成',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '異動別',
      field: 'wtype',
      sortable: false,
      numberField: true,
    },
    {
      header: '流水號',
      field: 'seqno',
      sortable: false,
      numberField: true,
    },
    {
      header: '原幣現值',
      field: 'nowamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '原幣損益試',
      field: 'unreal',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
    {
      header: '註記',
      field: 'ioflag',
      sortable: false,
    },
  ];
  constructor(
    private excelExportService: ExcelExportService,
    private lendUnrealdnMarketvalueService: LendUnrealdnMarketvalueService,
    private stockSuggestionsService: StockSuggestionsService,
    private addUserLogsService: AddUserLogsService,
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
    this.unrealSums = [];
    this.expendRows = [];
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const { stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: '',
      comp: '551',
      action: this.CheckBoxValue === '0' ? '' : this.CheckBoxValue,
      ctype: this.formGroup.get('ctype')?.getRawValue(),
      exchangeRate: this.formGroup.get('exchangeRate')?.getRawValue().rate,
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
    this.loadingMaskService.show();
    this.lendUnrealdnMarketvalueService
      .getKeepRate(this.searchParams)
      .subscribe({
        next: (response) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          if (Array.isArray(response)) {
            this.unrealSums = this.transColumnValue(response);
            // this.unrealSums.map((unrealSum) => unrealSum.header);
            this.hasSearched = true; // 設置為已查詢
            this.isSortable();
          } else {
            this.systemMessageService.error(response);
          }
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.unrealSums = [];
          this.loadingMaskService.hide();
          this.isSortable();
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
          this.formGroup.patchValue({ ctype: this.currencyOptions[0].value });
        }
      },
    });
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.unrealSums = []; // 清除 table
    this.expendRows = [];
    this.hasSearched = false;
    this.formGroup.get('exchangeRate')?.setValue(this.exchangeRateOptions[0]);
    this.formGroup.patchValue({ ctype: this.currencyOptions[0].value });
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.setFormValue();
    this.queryTime = null;
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
      '資料庫別',
      '分公司',
      '客戶帳號',
      '股票代碼',
      '股票名稱',
      '幣別',
      '參考匯率',
      '濾除下市股票',
      '不含稅費',
      '不計除息金',
    ];
    // 查詢條件資料
    const {
      APISERVER,
      bhno,
      cseq,
      stock,
      stockName,
      ctype,
      exchangeRate,
      checkbox1,
      checkbox2,
      checkbox3,
    } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stockName || '',
      this.getCurrency(ctype),
      this.getExchangeRate(exchangeRate),
      checkbox1 ? '✔' : '✘', //下載Excel，若為true，則Excel有打✔圖示，反之為打✘
      checkbox2 ? '✔' : '✘',
      checkbox3 ? '✔' : '✘',
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
        unrealSum.real_qty,
        unrealSum.qty,
        unrealSum.bqty,
        unrealSum.sqty,
        unrealSum.cost,
        unrealSum.avgprice,
        unrealSum.nowamt,
        unrealSum.unreal,
        unrealSum.urratio,
        unrealSum.lastprice,
        unrealSum.interest,
        unrealSum.divamt,
        unrealSum.AD,
        unrealSum.ADR,
        unrealSum.currnm,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }

  // 設定表單日期初始值的方法
  private setFormValue(): void {
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
      // if (item.unreal_details.unreal_detail) {
      //   const detailDateColumns = this.detailTableColumns
      //     .filter((item) => item.dateField)
      //     .map((item) => item.field);
      //   detailDateColumns.forEach((column) => {
      //     item.unreal_details.unreal_detail[column] =
      //       this.tranferColumnService.dateChange(
      //         item.unreal_details.unreal_detail[column],
      //       );
      //   });
      // }
    });
    return res;
  }

  showDialog(): void {
    this.visible = true;
  }

  get FilterData(): UnrealSum[] {
    return this.unrealSums.filter((item) => item.no != '合計');
  }
  get FilterTotalData(): UnrealSum[] {
    return this.unrealSums.filter((item) => item.no == '合計');
  }

  get CheckBoxValue(): string {
    const cvalue1 = this.formGroup.get('checkbox1')?.getRawValue() ? 1 : 0;
    const cvalue2 = this.formGroup.get('checkbox2')?.getRawValue() ? 2 : 0;
    const cvalue3 = this.formGroup.get('checkbox3')?.getRawValue() ? 4 : 0;
    const result = cvalue1 + cvalue2 + cvalue3;
    return result.toString();
  }

  get exchangeRateControl(): FormControl {
    return this.formGroup.get('exchangeRate') as FormControl;
  }

  get redInfo(): string {
    return `:${this.exchangeRateControl?.getRawValue().rate}(匯率日期:${
      this.exchangeRateControl?.getRawValue().tdate
    })`;
  }

  getDetailDate(data: string) {
    return this.tranferColumnService.dateChange(data);
  }

  getDetailData(data: UnrealDetail) {
    return Array.isArray(data) ? data : [data];
  }

  isSortable(): void {
    const isCntdProfitSumSort = this.FilterData.length > 2;

    this.tableColumns.forEach(
      (column) => (column.sortable = isCntdProfitSumSort),
    );

    this.tableComponent?.reset();
  }
}
