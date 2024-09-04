import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { concatMap } from 'rxjs';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { SearchParamsExcel } from 'src/app/features/query-cnlendback/models/search-params-excel.model';
import { ExcelTableList } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { ExchangeRateOption } from '../../models/exchange-rate-option.model';
import { SearchParams } from '../../models/search-params.model';
import { UnrealSums } from '../../models/unreal-sum.model';
import { UnrealPnlTotalQueryService } from '../../services/unreal-pnl-total-query.service';
@Component({
  selector: 'app-unreal-pnl-total-query',
  templateUrl: './unreal-pnl-total-query.component.html',
  styleUrls: ['./unreal-pnl-total-query.component.scss'],
})
export class UnrealPnlTotalQueryComponent extends BaseComponent {
  ttypeOptions: Option[] = [];
  currencyOptions: Option[] = []; // 動態下拉選單的 Options 資料
  exchangeRateOptions: ExchangeRateOption[] = [];
  @ViewChild('tableCopmonent') tableCopmonent!: Table; // 表格組件
  visible: boolean = false;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '未實現損益合計查詢(ID)'; // 頁面標題名稱
  unrealSums: UnrealSums[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
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
      field: 'stockname',
      sortable: false,
    },
    {
      header: '股數',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '成本',
      field: 'bcost',
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

  summaryTableColumns: TableColumn[] = [
    {
      header: '股數',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '成本',
      field: 'bcost',
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
    private unrealPnlTotalQueryService: UnrealPnlTotalQueryService,
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
      idno: ['', Validators.required],
      stock: [''],
      stockName: [''],
      ttype: [''],
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
    const { stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      ctype: this.formGroup.get('ctype')?.getRawValue(),
      ttype: this.formGroup.get('ttype')?.getRawValue(),
      action: this.CheckBoxValue === '0' ? '' : this.CheckBoxValue,
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
    this.unrealPnlTotalQueryService.getKeepRate(this.searchParams).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (Array.isArray(response)) {
          this.unrealSums = this.transColumnValue(response);
          this.hasSearched = true; // 設置為已查詢
        } else {
          this.systemMessageService.error(response);
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

    this.ttypeOptions = [
      {
        id: '',
        label: '全部',
        value: 'A',
      },
      {
        id: '',
        label: '現-上市櫃',
        value: '0',
      },
      {
        id: '',
        label: '資',
        value: '1',
      },
      {
        id: '',
        label: '券',
        value: '2',
      },
      {
        id: '',
        label: '興櫃',
        value: 'R',
      },
    ];
    this.formGroup.patchValue({ ttype: this.ttypeOptions[0].value });
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.unrealSums = []; // 清除 table
    this.hasSearched = false;
    this.formGroup.patchValue({
      exchangeRate: this.exchangeRateOptions[0],
      ctype: this.currencyOptions[0].value,
      ttype: this.ttypeOptions[0].value,
    });
    this.formGroup.patchValue(this.getUserInfoDefaultParams());

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
    const { idno } = this.searchParams;
    return `${this.titleName}_${idno}`;
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

  private getTType(value: string): string {
    const ttype = this.ttypeOptions.find((opt) => opt.value === value);
    return ttype ? ttype.label : value;
  }

  private getSearchParams(): SearchParamsExcel {
    // 查詢條件
    const paramHeadr = [
      '查詢帳中API主機',
      '身分證字號',
      '股票代碼',
      '股票名稱',
      '幣別',
      '參考匯率',
      '庫存類別',
      '濾除下市股票',
      '不含稅費',
      '不計除息金',
    ];
    // 查詢條件資料
    const {
      APISERVER,
      idno,
      stock,
      stockName,
      ctype,
      exchangeRate,
      ttype,
      checkbox1,
      checkbox2,
      checkbox3,
    } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      idno || '',
      stock || '',
      stockName || '',
      this.getCurrency(ctype),
      this.getExchangeRate(exchangeRate),
      this.getTType(ttype),
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
        unrealSum.stockname,
        unrealSum.qty,
        unrealSum.bcost,
        unrealSum.nowamt,
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
    const isSort =
      this.unrealSums.filter((data) => data.no !== '合計').length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.tableCopmonent) {
      this.tableCopmonent.reset();
    }
  }

  get FilterData(): UnrealSums[] {
    return this.unrealSums.filter((item) => item.no !== '合計');
  }
  get FilterTotalData(): UnrealSums[] {
    return this.unrealSums.filter((item) => item.no === '合計');
  }

  get CheckBoxValue(): string {
    const cvalue1 = this.formGroup.get('checkbox1')?.getRawValue() ? 1 : 0;
    const cvalue2 = this.formGroup.get('checkbox2')?.getRawValue() ? 2 : 0;
    const cvalue3 = this.formGroup.get('checkbox3')?.getRawValue() ? 4 : 0;
    const result = cvalue1 + cvalue2 + cvalue3;
    return result.toString();
  }

  showDialog(): void {
    this.visible = true;
  }
}
