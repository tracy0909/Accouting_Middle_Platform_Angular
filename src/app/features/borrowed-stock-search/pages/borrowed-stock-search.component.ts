import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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
import { BorrowedStockSearchRequest } from '../models/borrowed-stock-search-request.model';
import { BorrowedStockSearch } from '../models/borrowed-stock-search.model';
import { BorrowedStockSearchService } from '../services/borrowed-stock-search.service';

@Component({
  selector: 'borrowed-stock-search',
  templateUrl: './borrowed-stock-search.component.html',
  styleUrls: ['./borrowed-stock-search.component.scss'],
})
export class BorrowedStockSearchComponent extends BaseComponent {
  // 頁面標題名稱
  readonly titleName = '借入庫存查詢';
  // Table
  @ViewChild('borrowedStockTable') borrowedStockTable!: Table;
  // 輸入表單的 FormGroup，在 initFormGroup() 初始化
  formGroup!: FormGroup;
  // 表格資料陣列
  tableData: BorrowedStockSearch[] = [];
  // Table 的欄位設定
  tableColumns: TableColumn[] = [];
  // 合計資料的欄位設定
  totalTableColumns: TableColumn[] = [];
  // 查詢帳中API主機 下拉選單選項
  apiServerOptions: Option[] = [];
  // 分公司 下拉選單選項
  branchOptions: Option[] = [];
  // 紀錄下載查詢條件
  searchParams!: BorrowedStockSearchRequest;
  // 資料查詢時間
  queryTime: string | null = null;
  // 是否已進行查詢
  hasSearched: boolean = false;
  // 權限
  buttonList!: ButtonList;

  constructor(
    private fb: FormBuilder,
    private borrowedStockSearchService: BorrowedStockSearchService,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
    private stockSuggestionsService: StockSuggestionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initTableColumns();
    this.setOptions();
    this.buttonList = this.authButtonList;
  }

  // 初始化表單
  private initFormGroup(): void {
    this.formGroup = this.fb.nonNullable.group({
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

  // 初始化表格
  private initTableColumns(): void {
    this.tableColumns = [
      {
        header: '筆數',
        field: 'no',
        sortable: false,
        numberField: true,
      },
      {
        header: '交易類別',
        field: 'ttype',
        sortable: false,
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
        numberField: true,
      },
      {
        header: '即時庫存股數',
        field: 'real_qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '昨日庫存股數',
        field: 'qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '今日借入股數',
        field: 'borrowqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '匯入股數',
        field: 'importqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '今日借入賣出成交股數',
        field: 'sellqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '匯出股數',
        field: 'exportqty',
        sortable: false,
        numberField: true,
      },
    ];
    this.totalTableColumns = [
      {
        header: '即時庫存股數',
        field: 'real_qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '昨日庫存股數',
        field: 'qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '今日借入股數',
        field: 'borrowqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '匯入股數',
        field: 'importqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '今日借入賣出成交股數',
        field: 'sellqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '匯出股數',
        field: 'exportqty',
        sortable: false,
        numberField: true,
      },
    ];
  }

  doQuery() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    // 查詢前先清空 table
    this.tableData = [];
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
    // console.log('searchParams', this.searchParams);
    this.loadingMaskService.show();
    // 改為 已查詢
    this.hasSearched = true;
    this.borrowedStockSearchService
      .getBorrowedStockSearch(this.searchParams)
      .subscribe({
        next: (response) => {
          // 資料查詢時間
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          if (Array.isArray(response)) {
            this.tableData = response;
            // console.log('tableData', this.tableData);
            this.isSortable();
          } else {
            this.systemMessageService.error(response);
          }
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.tableData = [];
          this.loadingMaskService.hide();
        },
      });
  }

  onClear(): void {
    this.formGroup.reset(); // 重置表單
    this.tableData = []; // 清除 table
    this.isSortable(); // 移除排序
    this.hasSearched = false; // 重置查詢狀態
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.queryTime = ''; // 重製查詢時間
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
    const { APISERVER, bhno, cseq, stock, stockName } = this.searchParams;
    // console.log(this.searchParams);
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stockName || '',
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
        tableData.ttype,
        tableData.stock,
        tableData.stocknm,
        tableData.real_qty,
        tableData.qty,
        tableData.borrowqty,
        tableData.importqty,
        tableData.sellqty,
        tableData.exportqty,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }

  private getDatabase(value: string): string {
    const database = this.apiServerOptions.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  get getExportFileName(): string {
    const { bhno, cseq } = this.searchParams;
    return `${this.titleName}_${bhno}_${cseq}`;
  }

  // 查詢條件的下拉選單選項
  setOptions(): void {
    // 帳中API主機
    this.optionService.getAPIServerOptions().subscribe({
      next: (apiServerOptions) => {
        this.apiServerOptions = apiServerOptions;
      },
    });
    // 分公司
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
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  // 不包含合計資料
  get FilterData(): BorrowedStockSearch[] {
    return this.tableData.filter((item) => item.no !== '合計');
  }

  // 合計資料
  get FilterTotalData(): BorrowedStockSearch[] {
    return this.tableData.filter((item) => item.no === '合計');
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort =
      this.tableData.filter((data) => data.no !== '合計').length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.borrowedStockTable) {
      this.borrowedStockTable.reset();
    }
  }

  // 表單的值若為空值，顯示紅框警告
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || formControl.touched)
      : false;
  }

  // 格式錯誤訊息提示
  showErrorMessage(name: string): string {
    const control = this.formGroup.get(name);
    if (control?.errors?.['required']) {
      return `此欄位必須輸入`;
    }
    return '';
  }
}
