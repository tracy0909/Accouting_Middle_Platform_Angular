import { DatePipe } from '@angular/common';
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
import { LoanTradeQueryRequest } from '../models/loan-trade-query-resquest.model';
import { ProfileDetail } from '../models/profile-detail.model';
import { ProfileSum } from '../models/profile-sum.model';
import { LoanTradeQueryService } from '../service/loan-trade-query.service';

@Component({
  selector: 'app-loan-trade-query',
  templateUrl: './loan-trade-query.component.html',
  styleUrls: ['./loan-trade-query.component.scss'],
})
export class LoanTradeQueryComponent extends BaseComponent {
  @ViewChild('tableSumComponent') tableSumComponent!: Table; // 表格組件
  @ViewChild('tableDetailComponent') tableDetailComponent!: Table; // 表格組件
  readonly titleName = '借賣成交查詢'; // 頁面標題名稱
  readonly totalName = '合計'; // 頁面標題名稱
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  buttonList!: ButtonList;
  queryTime: string | null = null; // 資料查詢時間
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  searchParams!: LoanTradeQueryRequest;
  profileSumTableData: ProfileSum[] = [];
  profileDetailTableData: ProfileDetail[] = [];
  expendRows: any = [];

  profileSumTableColumns: TableColumn[] = [
    {
      header: '筆數',
      field: 'no',
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
      header: '股數',
      field: 'qty',
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
      header: '預估收付',
      field: 'netamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];
  profileDetailTableColumns: TableColumn[] = [
    {
      header: '交易日期',
      field: 'tdate',
      dateField: true,
      sortable: false,
    },
    {
      header: '成交時間',
      field: 'mtime',
      sortable: false,
      dateField: true,
    },
    {
      header: '委託書號',
      field: 'dseq',
      sortable: false,
    },
    {
      header: '股數',
      field: 'qty',
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
      header: '預估收付',
      field: 'netamt',
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
      header: '股數',
      field: 'qty',
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
      header: '預估收付',
      field: 'netamt',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private loanTradeQueryService: LoanTradeQueryService,
    private datePipe: DatePipe,
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
    this.setFormValue();
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      APISERVER: ['', Validators.required],
      bhno: ['', Validators.required],
      cseq: ['', Validators.required],
      bdate: [''],
      edate: [''],
      stock: [''],
      stockName: [''],
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }

    this.formGroup.get('stockName')?.disable();
  }

  onSearch(): void {
    this.profileSumTableData = []; // 清除 table
    this.profileDetailTableData = []; // 清除 table
    this.expendRows = [];
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const { bdate, edate, stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
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
    this.loadingMaskService.show();
    this.loanTradeQueryService.getLoanTrade(this.searchParams).subscribe({
      next: (response) => {
        // console.log(response);
        this.loadingMaskService.hide();
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });

        let validResponse = true;

        if (
          response &&
          typeof response === 'object' &&
          Array.isArray(response)
        ) {
          this.profileSumTableData = this.transColumnValue(response);
          // console.log(this.profileSumTableData);
        } else if (typeof response === 'string') {
          this.systemMessageService.error(response);
          validResponse = false;
        }
        if (!validResponse) {
          this.profileSumTableData = [];
          this.profileDetailTableData = [];
        }
        this.hasSearched = true;
        this.isSortable();
      },
      error: (error) => {
        this.expendRows = [];
        this.profileSumTableData = [];
        this.profileDetailTableData = [];
      },
    });
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.profileSumTableData = []; // 清除 table
    this.profileDetailTableData = []; // 清除 table
    this.expendRows = [];
    this.hasSearched = false;
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.setFormValue();
    this.queryTime = '';
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
      '客戶帳號',
      '撥券起始日期',
      '撥券結束日期 ',
      '股票代碼',
      '股票名稱',
      '分公司',
    ];
    // 查詢條件資料
    const { APISERVER, cseq, bdate, edate, stock, stocknm, bhno } =
      this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      cseq || '',
      bdate || '',
      edate || '',
      stock || '',
      stocknm || '',
      this.getBranchLabel(bhno), // 轉換分公司
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const sumTableHeader = this.profileSumTableColumns.map(
      (column) => column.header,
    );
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const sumExportData = this.profileSumTableData.map((tableData) => {
      const stringArr = [
        tableData.no,
        tableData.ttypename,
        tableData.stock,
        tableData.stocknm,
        tableData.qty,
        tableData.price,
        tableData.mamt,
        tableData.fee,
        tableData.tax,
        tableData.netamt,
        tableData.currnm,
      ];
      return [...stringArr];
    });

    return [{ tableHeader: sumTableHeader, tableData: sumExportData }];
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  getDetailDate(data: string) {
    return this.tranferColumnService.dateChange(data);
  }

  onProfileDetailClick(data: any) {
    return Array.isArray(data) ? data : [data];
  }

  private setFormValue(): void {
    const today = new Date();
    const threeMonthsPrior = new Date(today.setMonth(today.getMonth() - 3));
    this.formGroup.get('edate')?.setValue(new Date());
    this.formGroup.get('bdate')?.setValue(threeMonthsPrior);
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
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSumSort = this.profileSumTableData.length > 2;

    // 假設你要檢查第一個 ProfileSum 物件的 profile_details
    const firstProfileSum = this.profileSumTableData[0];

    // 確保 firstProfileSum 和 profile_details 存在
    const isDetailSort = firstProfileSum
      && firstProfileSum.profile_details
      && Object.keys(firstProfileSum.profile_details).length > 0;

    // console.log('isDetailSort:', isDetailSort);
    // console.log('ProfileSum Data:', this.profileSumTableData);

    this.profileSumTableColumns.forEach((column) => {
      column.sortable = isSumSort;
    });

    this.profileDetailTableColumns.forEach((column) => {
      column.sortable = isDetailSort;
    });

    // 如果表格存在，重置表格狀態
    this.tableSumComponent?.reset();
    this.tableDetailComponent?.reset();
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

  // 為 any 原因是因為回傳的資料確定，但因為要使用[變數]所侷限故使用 any
  private transColumnValue(res: any[]): any[] {
    const customerColumns = this.profileDetailTableColumns
      .filter((item) => item.customField)
      .map((item) => item.field);
    const dateColumns = this.profileDetailTableColumns
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

  get FilterData(): ProfileSum[] {
    return this.profileSumTableData.filter((item) => item.no !== '合計');
  }
  get FilterTotalData(): ProfileSum[] {
    return this.profileSumTableData.filter((item) => item.no === '合計');
  }

}
