import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { ExcelTableList, SearchParam } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { CollateralValueQueryRequest } from '../models/collateral-value-query-resquest.model';
import { CollateralValueQueryService } from '../service/collateral-value-query.service';

@Component({
  selector: 'app-collateral-value-query',
  templateUrl: './collateral-value-query.component.html',
  styleUrls: ['./collateral-value-query.component.scss'],
})
export class CollateralValueQueryComponent extends BaseComponent {
  @ViewChild('tableComponent') tableComponent!: Table;
  @ViewChild('lenddnTableComponent') lenddnTableComponent!: Table;
  readonly titleName = '擔保品市值查詢'; // 頁面標題名稱
  readonly collateral = '信用擔保品'; // 頁面標題名稱
  readonly lenddn = 'T+5借貸款項擔保品'; // 頁面標題名稱
  readonly collateralTotal = '信用擔保品 - 合計'; // 頁面標題名稱
  readonly lenddnTotalName = 'T+5借貸款項擔保品 - 合計'; // 頁面標題名稱
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  currencyOptions: Option[] = []; // 動態下拉選單的 Options 資料
  buttonList!: ButtonList;
  queryTime: string | null = null; // 資料查詢時間
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  tableData: any[] = []; // 表格資料數組
  lenddnTableData: any[] = []; // 表格資料數組
  searchParams!: CollateralValueQueryRequest;
  visible: boolean = false;

  tableColumns: TableColumn[] = [
    {
      header: '筆數',
      field: 'no',
      numberField: true,
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
      header: '信用擔保品總庫存股數',
      field: 'qty',
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
      header: '現值',
      field: 'nowamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  totalTableColumns: TableColumn[] = [
    {
      header: '信用擔保品總庫存股數',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '現值',
      field: 'nowamt',
      sortable: false,
      numberField: true,
    },
  ];

  lenddnTableColumns: TableColumn[] = [
    {
      header: '筆數',
      field: 'no',
      numberField: true,
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
      header: '信用擔保品總庫存股數',
      field: 'qty',
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
      header: '現值',
      field: 'nowamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  lenddnTotalTableColumns: TableColumn[] = [
    {
      header: '信用擔保品總庫存股數',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '現值',
      field: 'nowamt',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private collateralValueQueryService: CollateralValueQueryService,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
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
      bhno: ['', Validators.required],
      cseq: ['', Validators.required],
      stock: [''],
      stockName: [''],
      ctype: ['A'],
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }

    this.formGroup.get('stockName')?.disable();
  }

  onSearch(): void {
    this.tableData = [];
    this.lenddnTableData = [];

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { stock } = this.formGroup.value;

    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
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
    // console.log(this.searchParams);
    this.loadingMaskService.show();
    this.collateralValueQueryService
      .getCollateralValue(this.searchParams)
      .subscribe({
        next: (response) => {
          this.loadingMaskService.hide();

          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });

          const processResponseArray = (arrayData: any, targetArray: any[]) => {
            if (Array.isArray(arrayData)) {
              targetArray.push(...arrayData);
              return true;
            }
            return false;
          };

          const isValidResponse =
            processResponseArray(response.creditdn_sum, this.tableData) &&
            processResponseArray(response.lenddn_sum, this.lenddnTableData);

          if (!isValidResponse) {
            if (typeof response === 'string') {
              this.systemMessageService.error(response);
            }
            this.tableData = [];
            this.lenddnTableData = [];
          }

          this.hasSearched = true;
          this.isSortable();
        },
        error: (error) => {
          this.tableData = [];
          this.lenddnTableData = [];
          this.loadingMaskService.hide();
        },
      });
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.tableData = []; // 清除 table
    this.lenddnTableData = []; // 清除 table
    this.hasSearched = false;
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.queryTime = '';
  }

  // 計算方式 dialog
  showDialog(): void {
    this.visible = true;
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

  private getSearchParams(): SearchParam {
    // 查詢條件
    const paramHeadr = [
      '查詢帳中API主機',
      '分公司',
      '客戶帳號',
      '股票代碼',
      '股票名稱',
      '幣別',
    ];
    // 查詢條件資料
    const { APISERVER, cseq, stock, stocknm, bhno, ctype } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stocknm || '',
      this.getCurrency(ctype), // 轉換幣别
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const screditdnTableHeader = this.tableColumns.map(
      (column) => column.header,
    );
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const creditdnExportData = this.tableData.map((tableData) => {
      const stringArr = [
        tableData.no,
        tableData.stock,
        tableData.stocknm,
        tableData.qty,
        tableData.lastprice,
        tableData.nowamt,
        tableData.currnm,
      ];
      return [...stringArr];
    });

    const lenddnTableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const lenddnExportData = this.lenddnTableData.map((tableData) => {
      const stringArr = [
        tableData.no,
        tableData.stock,
        tableData.stocknm,
        tableData.qty,
        tableData.lastprice,
        tableData.nowamt,
        tableData.currnm,
      ];
      return [...stringArr];
    });

    const creditCollateralTitle = ['信用擔保品'];
    const loanCollateralTitle = ['T+5借貸款項擔保品'];

    return [
      { tableHeader: creditCollateralTitle, tableData: [] },
      { tableHeader: screditdnTableHeader, tableData: creditdnExportData },
      { tableHeader: loanCollateralTitle, tableData: [] },
      { tableHeader: lenddnTableHeader, tableData: lenddnExportData },
    ];
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  private getCurrency(value: string): string {
    const currency = this.currencyOptions.find((opt) => opt.value === value);
    return currency ? currency.label : value;
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 2;
    const isLenddnSort = this.lenddnTableData.length > 2;
    this.tableColumns.map((column) => (column.sortable = isSort));
    this.lenddnTableColumns.map((column) => (column.sortable = isLenddnSort));
    this.tableComponent?.reset();
    this.lenddnTableComponent?.reset();
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
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

  get FilterData(): any[] {
    return this.tableData.filter((item) => item.no !== '合計');
  }

  get FilterTotalData(): any[] {
    return this.tableData.filter((item) => item.no === '合計');
  }
  get lenddnFilterData(): any[] {
    return this.lenddnTableData.filter((item) => item.no !== '合計');
  }

  get lenddnFilterTotalData(): any[] {
    return this.lenddnTableData.filter((item) => item.no === '合計');
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
}
