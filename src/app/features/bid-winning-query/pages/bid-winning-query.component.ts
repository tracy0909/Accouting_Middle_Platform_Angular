import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { ExcelTableList } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { BidWinningQueryResponse } from '../models/bid-winning-query-response.model';
import { BidWinningQueryRequest } from '../models/bid-winning-query-resquest.model';
import { SearchParams } from '../models/search-params ';
import { BidWinningQueryService } from '../service/bid-winning-query.service';

@Component({
  selector: 'app-bid-winning-query',
  templateUrl: './bid-winning-query.component.html',
  styleUrls: ['./bid-winning-query.component.scss'],
})
export class BidWinningQueryComponent extends BaseComponent {
  @ViewChild('tableComponent') tableComponent!: Table; // 表格組件
  readonly titleName = '競拍得標查詢'; // 頁面標題名稱
  readonly totalName = '合計'; // 頁面標題名稱
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  buttonList!: ButtonList;
  queryTime: string | null = null; // 資料查詢時間
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  tableData: BidWinningQueryResponse[] = []; // 表格資料數組
  searchParams!: BidWinningQueryRequest;

  tableColumns: TableColumn[] = [
    {
      header: '筆數',
      field: 'no',
      numberField: true,
    },
    {
      header: '撥券日期',
      field: 'stkdate',
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
      field: 'stocknm',
      sortable: false,
    },
    {
      header: '投標起始日',
      field: 'begindate',
      sortable: false,
      dateField: true,
    },
    {
      header: '開標日期',
      field: 'biddate',
      sortable: false,
      dateField: true,
    },
    {
      header: '得標價格',
      field: 'winprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '得標股數',
      field: 'winqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '扣繳保證金',
      field: 'gtamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '扣繳投標處理費',
      field: 'bidfee',
      sortable: false,
      numberField: true,
    },
    {
      header: '扣繳得標尾款',
      field: 'balance',
      sortable: false,
      numberField: true,
    },
    {
      header: '扣繳得標手續費',
      field: 'winfee',
      sortable: false,
      numberField: true,
    },
    {
      header: '成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '取消註記',
      field: 'cflag',
      sortable: false,
    },
  ];

  totalTableColumns: TableColumn[] = [
    {
      header: '',
      field: 'no',
      numberField: true,
    },
    {
      header: '得標股數',
      field: 'winqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '扣繳保證金',
      field: 'gtamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '扣繳投標處理費',
      field: 'bidfee',
      sortable: false,
      numberField: true,
    },
    {
      header: '扣繳得標尾款',
      field: 'balance',
      sortable: false,
      numberField: true,
    },
    {
      header: '扣繳得標手續費',
      field: 'winfee',
      sortable: false,
      numberField: true,
    },
    {
      header: '成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private bidWinningQueryService: BidWinningQueryService,
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

  private setFormValue(): void {
    const today = new Date();
    const threeMonthsPrior = new Date(today.setMonth(today.getMonth() - 3));
    this.formGroup.get('edate')?.setValue(new Date());
    this.formGroup.get('bdate')?.setValue(threeMonthsPrior);
  }

  onSearch(): void {
    this.tableData = []; // 清除 table
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.tableData = [];
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
    this.bidWinningQueryService.getBidWinning(this.searchParams).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });

        if (Array.isArray(response)) {
          const mappedResponse = response.map((item) => {
            const { cflag } = item;
            let statusString = '';
            switch (cflag) {
              case 'Y':
                statusString = StatusCodeEnum.FAIL;
                break;
              case 'F':
                statusString = StatusCodeEnum.CANCEL;
                break;
              default:
                statusString = cflag;
            }
            // console.log('statusString:', statusString);
            return {
              ...item,
              cflag: statusString,
            };
          });

          this.tableData = this.transColumnValue(mappedResponse);
          // console.log('tableData', this.tableData);
          this.hasSearched = true;
        } else {
          this.systemMessageService.error(response);
        }
        this.loadingMaskService.hide();
        this.isSortable();
        // console.log(response);
      },
      error: (error) => {
        this.tableData = [];
        this.loadingMaskService.hide();
      },
    });
  }

  get FilterData(): BidWinningQueryResponse[] {
    return this.tableData.filter((item) => item.no !== '合計');
  }

  get FilterTotalData(): BidWinningQueryResponse[] {
    return this.tableData.filter((item) => item.no === '合計');
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.tableData = []; // 清除 table
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

  private getSearchParams(): SearchParams {
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
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const exportData = this.tableData.map((tableData, index) => {
      const stringArr = [
        tableData.no,
        tableData.stkdate,
        tableData.stock,
        tableData.stocknm,
        tableData.begindate,
        tableData.biddate,
        tableData.winprice,
        tableData.winqty,
        tableData.gtamt,
        tableData.bidfee,
        tableData.balance,
        tableData.winfee,
        tableData.cost,
        tableData.cflag,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    // 檢查歷史對帳單明細部分資料是否有內容，如果有內容則允許排序
    const isSort =
      this.tableData.filter((item) => item.no !== '合計').length > 1;

    // 遍歷表格列定義，將每個欄位的sortable屬性設定為isSort的值
    this.tableColumns.map((column) => (column.sortable = isSort));

    // 如果表格存在，重置表格狀態
    if (this.tableComponent) {
      this.tableComponent.reset();
    }
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
}

enum StatusCodeEnum {
  FAIL = '失敗',
  CANCEL = '取消',
}
