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
import {
  LendDetail,
  LendSum,
} from '../models/stock-lending-query-response.model';
import { StockLendingQueryRequest } from '../models/stock-lending-query-resquest.model';
import { StockLendingQueryService } from '../service/stock-lending-query.service';

@Component({
  selector: 'app-stock-lending-query',
  templateUrl: './stock-lending-query.component.html',
  styleUrls: ['./stock-lending-query.component.scss'],
})
export class StockLendingQueryComponent extends BaseComponent {
  @ViewChild('tableSumComponent') tableSumComponent!: Table; // 表格組件
  @ViewChild('tableDetailComponent') tableDetailComponent!: Table; // 表格組件
  readonly titleName = '現股出借查詢'; // 頁面標題名稱
  readonly totalName = '小計'; // 頁面標題名稱
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  buttonList!: ButtonList;
  searchParams!: StockLendingQueryRequest;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  lendSumTableData: LendSum[] = [];
  lendDetailTableData: LendDetail[] = [];
  expendRows: any = [];
  visible: boolean = false;

  lendSumTableColumns: TableColumn[] = [
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
      header: '出借股數',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '出借收入淨額',
      field: 'income',
      sortable: false,
      numberField: true,
    },
  ];
  lendDetailTableColumns: TableColumn[] = [
    {
      header: '出借日期',
      field: 'ldate',
      sortable: false,
      dateField: true,
    },
    {
      header: '序號',
      field: 'seqno',
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
      header: '續借日期',
      field: 'cdate',
      sortable: false,
    },
    {
      header: '交易別',
      field: 'type',
      sortable: false,
      numberField: true,
    },
    {
      header: '出借費率',
      field: 'rate',
      sortable: false,
      numberField: true,
    },
    {
      header: '原出借股數',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '未還出借股數',
      field: 'bqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '出借收入',
      field: 'dbfee',
      sortable: false,
      numberField: true,
    },
    {
      header: '出借服務費',
      field: 'sfee',
      sortable: false,
      numberField: true,
    },
    {
      header: '出借收入淨額',
      field: 'income',
      sortable: false,
      numberField: true,
    },
    {
      header: '議借還劵日期',
      field: 'ndate',
      sortable: false,
      dateField: true,
    },
  ];
  totalTableColumns: TableColumn[] = [
    {
      header: '出借股數',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '出借收入淨額',
      field: 'income',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private stockLendingQueryService: StockLendingQueryService,
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
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }

    this.formGroup.get('stockName')?.disable();
  }

  onSearch(): void {
    this.lendSumTableData = []; // 清除 table
    this.lendDetailTableData = []; // 清除 table
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
    // console.log(this.searchParams);
    this.addUserLogsService.addUserLog(log);
    this.loadingMaskService.show();
    this.stockLendingQueryService.getStockLending(this.searchParams).subscribe({
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
          this.lendSumTableData = response;

          for (const sum of this.lendSumTableData) {
            if (sum.lend_details?.lend_detail) {
              if (Array.isArray(sum.lend_details.lend_detail)) {
                sum.lend_details.lend_detail = sum.lend_details.lend_detail.map(
                  (detail: any) => ({
                    ...detail,
                    stock: sum.stock,
                    stocknm: sum.stocknm,
                  }),
                );
              } else {
                sum.lend_details.lend_detail = {
                  ...sum.lend_details.lend_detail,
                  stock: sum.stock,
                  stocknm: sum.stocknm,
                };
              }
              // console.log('updated lend_de。tail', sum.lend_details.lend_detail);
            }
          }

          // console.log(this.lendSumTableData);
        } else if (typeof response === 'string') {
          this.systemMessageService.error(response);
          validResponse = false;
        }
        if (!validResponse) {
          this.lendSumTableData = [];
          this.lendDetailTableData = [];
        }
        this.hasSearched = true;
        this.isSortable();
      },
      error: (error) => {
        this.expendRows = [];
        this.lendSumTableData = [];
        this.lendDetailTableData = [];
      },
    });
  }

  // 清除表單並重置
  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.lendSumTableData = []; // 清除 table
    this.lendDetailTableData = []; // 清除 table
    this.hasSearched = false;
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.expendRows = [];
    this.isSortable();
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
      '分公司',
      '客戶帳號',
      '股票代碼',
      '股票名稱',
    ];
    // 查詢條件資料
    const { APISERVER, cseq, stock, stocknm, bhno } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stocknm || '',
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const sumTableHeader = this.lendSumTableColumns.map(
      (column) => column.header,
    );
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const sumExportData = this.lendSumTableData.map((tableData) => {
      const stringArr = [
        tableData.no,
        tableData.stock,
        tableData.stocknm,
        tableData.qty,
        tableData.income,
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

  getDetailData(data: any) {
    return Array.isArray(data) ? data : [data];
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSumSort = this.lendSumTableData.length > 2;

    const firstProfileSum = this.lendSumTableData[0];

    const isDetailSort = firstProfileSum
      && firstProfileSum.lend_details
      && Object.keys(firstProfileSum.lend_details).length > 0;

    // 遍歷表格列定義，將每個欄位的sortable屬性設定為isSort的值
    this.lendSumTableColumns.forEach((column) => (column.sortable = isSumSort));

    this.lendDetailTableColumns.forEach(
      (column) => (column.sortable = isDetailSort),
    );

    // 如果表格存在，重置表格狀態
    this.tableSumComponent?.reset();
    this.tableDetailComponent?.reset();
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

  showDialog(): void {
    this.visible = true;
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  get FilterData(): any[] {
    return this.lendSumTableData.filter((item) => item.no !== '小計');
  }
  get FilterTotalData(): any[] {
    return this.lendSumTableData.filter((item) => item.no === '小計');
  }
}
