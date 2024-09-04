import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { SearchParamsExcel } from 'src/app/features/query-cnlendback/models/search-params-excel.model';
import { ExcelTableList } from 'src/app/shared/models/excel.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { Option } from 'src/app/shared/models/option.model';
import { TradePnlQueryService } from '../../services/trade-pnl-query.service';
import { TypeOption } from '../../models/type-option.model';
import { SearchParams } from '../../models/search-params.model';
import { Profit } from '../../models/profit.model';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
@Component({
  selector: 'app-trade-pnl-query',
  templateUrl: './trade-pnl-query.component.html',
  styleUrls: ['./trade-pnl-query.component.scss'],
})
export class TradePnlQueryComponent extends BaseComponent {
  @ViewChild('tableCopmonent') tableCopmonent!: Table; // 表格組件
  cTypeOptions!: TypeOption[];
  tTypeOptions!: TypeOption[];
  typeOptions!: TypeOption[];
  visible: boolean = false;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '成交回報損益查詢'; // 頁面標題名稱
  profits: Profit[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
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
      header: '成交時間',
      field: 'mtime',
      sortable: false,
    },
    {
      header: '委託書號',
      field: 'dseq',
      sortable: false,
    },
    {
      header: '交易別',
      field: 'ttypename',
      sortable: false,
    },
    {
      header: '買賣別',
      field: 'bstypename',
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
      header: '成交金額',
      field: 'mamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '融資金額',
      field: 'cramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '擔保品',
      field: 'dnamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '保證金',
      field: 'gtamt',
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
      header: '利息',
      field: 'interest',
      sortable: false,
      numberField: true,
    },
    {
      header: '借券費',
      field: 'dbfee',
      sortable: false,
      numberField: true,
    },
    {
      header: '預估收付',
      field: 'netamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'testpro',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'ts_ratio',
      sortable: false,
      numberField: true,
    },
    {
      header: '參考成本',
      field: 'cost',
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
      header: '數量',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '成交金額',
      field: 'mamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '融資金額',
      field: 'cramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '擔保品',
      field: 'dnamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '保證金',
      field: 'gtamt',
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
      header: '利息',
      field: 'interest',
      sortable: false,
      numberField: true,
    },
    {
      header: '借券費',
      field: 'dbfee',
      sortable: false,
      numberField: true,
    },
    {
      header: '預估收付',
      field: 'netamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'testpro',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'ts_ratio',
      sortable: false,
      numberField: true,
    },
    {
      header: '參考成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private excelExportService: ExcelExportService,
    private tradePnlQueryService: TradePnlQueryService,
    private addUserLogsService: AddUserLogsService,
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
      ttype: [''],
      ctype: [''],
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
    this.profits = [];

    const { stock } = this.formGroup.value;

    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      type: this.formGroup.get('type')?.getRawValue().value,
      ttype: this.formGroup.get('ttype')?.getRawValue().value,
      ctype: this.formGroup.get('ctype')?.getRawValue().value,
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
    this.tradePnlQueryService.getProfits(this.searchParams).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (Array.isArray(response)) {
          this.profits = this.transColumnValue(response);
          this.hasSearched = true; // 設置為已查詢
        } else {
          this.systemMessageService.error(response);
        }
        this.loadingMaskService.hide();
        this.isSortable();
      },
      error: (error) => {
        this.profits = [];
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
      { typeName: '彙總', value: '1' },
      { typeName: '明細', value: '2' },
    ];
    this.tTypeOptions = [
      { typeName: '全部', value: '0' },
      { typeName: '現賣', value: '1' },
      { typeName: '資買', value: '2' },
      { typeName: '資賣', value: '3' },
      { typeName: '資沖', value: '4' },
      { typeName: '券買', value: '5' },
      { typeName: '券賣', value: '6' },
      { typeName: '券沖', value: '7' },
      { typeName: '資買', value: '8' },
      { typeName: '興買', value: 'R' },
      { typeName: '興賣', value: 'S' },
    ];
    this.cTypeOptions = [
      { typeName: '全部', value: 'A' },
      { typeName: '台幣', value: 'NTD' },
      { typeName: '人民幣', value: 'CNY' },
    ];
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.profits = []; // 清除 table
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
      '交易類別',
      '幣別',
    ];
    // 查詢條件資料
    const { APISERVER, bhno, cseq, stock, stockName, type } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stockName || '',
      type == '1' ? '彙總' : '明細',
      this.formGroup.get('ctype')?.getRawValue().typeName,
      this.formGroup.get('ttype')?.getRawValue().typeName,
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const exportData = this.profits.map((profit, index) => {
      const stringArr = [
        index != this.profits.length - 1 ? index + 1 : '合計',
        profit.mtime,
        profit.dseq,
        profit.ttypename,
        profit.bstypename,
        profit.stock,
        profit.stocknm,
        profit.qty,
        profit.price,
        profit.mamt,
        profit.cramt,
        profit.dnamt,
        profit.gtamt,
        profit.fee,
        profit.tax,
        profit.interest,
        profit.dbfee,
        profit.netamt,
        profit.testpro,
        profit.ts_ratio,
        profit.cost,
        profit.currnm,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }

  // 設定表單日期初始值的方法
  private setFormValue(): void {
    this.formGroup.get('type')?.setValue(this.typeOptions[0]);
    this.formGroup.get('ttype')?.setValue(this.tTypeOptions[8]);
    this.formGroup.get('ctype')?.setValue(this.cTypeOptions[0]);
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
    const isSort = this.profits.length > 2;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);
    if (this.tableCopmonent) {
      this.tableCopmonent.reset();
    }
  }

  get FilterData(): Profit[] {
    return this.profits.filter((item) => item.ttypename !== '');
  }
  get FilterTotalData(): Profit[] {
    return this.profits.filter((item) => item.ttypename === '');
  }

  showDialog(): void {
    this.visible = true;
  }
}
