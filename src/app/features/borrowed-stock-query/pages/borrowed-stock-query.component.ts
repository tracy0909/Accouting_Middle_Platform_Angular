import { DatePipe } from '@angular/common';
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
import { BorrowedDnamtQueryRequest } from '../models/borrowed-dnamt-query-request.model';
import { BorrowedDnamtQueryResponse } from '../models/borrowed-dnamt-query-response.model';
import { BorrowedReplyQueryResponse } from '../models/borrowed-reply-query-response.model';
import { BorrowedStockQueryRequest } from '../models/borrowed-stock-query-request.model';
import { BorrowedStockQueryResponse } from '../models/borrowed-stock-query-response.model';
import { BorrowedStockQueryService } from '../services/borrowed-stock-query.service';

@Component({
  selector: 'app-borrowed-stock-query',
  templateUrl: './borrowed-stock-query.component.html',
  styleUrls: ['./borrowed-stock-query.component.scss'],
})
export class BorrowedStockQueryComponent extends BaseComponent {
  // 頁面標題名稱
  readonly titleName = '借券明細查詢';
  // Table
  @ViewChild('borrowedStockQueryTable') borrowedStockQueryTable!: Table;
  // 輸入表單的 FormGroup，在 initFormGroup() 初始化
  formGroup!: FormGroup;
  // 表格資料
  tableData: BorrowedStockQueryResponse[] = [];
  // 擔保金表格資料
  tableDnamtData: BorrowedDnamtQueryResponse[] = [];
  // 償還明細表格資料
  tableReplyData: BorrowedReplyQueryResponse[] = [];
  // Table 的欄位設定
  tableColumns: TableColumn[] = [];
  // 合計資料的欄位設定
  totalTableColumns: TableColumn[] = [];
  // 擔保金的欄位設定
  tableDnamtColumns: TableColumn[] = [];
  // 償還明細的欄位設定
  tableReplyColumns: TableColumn[] = [];
  // 查詢帳中API主機 下拉選單選項
  apiServerOptions: Option[] = [];
  // 分公司 下拉選單選項
  branchOptions: Option[] = [];
  // 紀錄下載查詢條件
  searchParams!: BorrowedStockQueryRequest;
  // 資料查詢時間
  queryTime: string | null = null;
  // 是否已進行查詢
  hasSearched: boolean = false;
  // 權限
  buttonList!: ButtonList;
  // 行的索引
  selectedRowIndex: number | null = null;
  // 控制資料展開
  expendRows: any = [];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private borrowedStockQueryService: BorrowedStockQueryService,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
    private stockSuggestionsService: StockSuggestionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initTableColumns();
    this.setFormValue();
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
      bdate: [''],
      edate: [''],
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
        header: '借入日期',
        field: 'brdate',
        sortable: false,
      },
      {
        header: '到期日期',
        field: 'edate',
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
        header: '借券書號',
        field: 'dseq',
        sortable: false,
      },
      {
        header: '借券費率',
        field: 'rate',
        sortable: false,
        numberField: true,
      },
      {
        header: '借券股數',
        field: 'qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '未還借券股數',
        field: 'bqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '折合擔保金',
        field: 'dnamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '單筆維持率',
        field: 'keeprate',
        sortable: false,
        numberField: true,
      },
      {
        header: '累計借券費',
        field: 'dbfee',
        sortable: false,
        numberField: true,
      },
      {
        header: '累計借券手續費',
        field: 'brfee',
        sortable: false,
        numberField: true,
      },
    ];
    this.totalTableColumns = [
      {
        header: '借券費率',
        field: 'rate',
        sortable: false,
        numberField: true,
      },
      {
        header: '借券股數',
        field: 'qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '未還借券股數',
        field: 'bqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '折合擔保金',
        field: 'dnamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '單筆維持率',
        field: 'keeprate',
        sortable: false,
        numberField: true,
      },
      {
        header: '累計借券費',
        field: 'dbfee',
        sortable: false,
        numberField: true,
      },
      {
        header: '累計借券手續費',
        field: 'brfee',
        sortable: false,
        numberField: true,
      },
    ];
    this.tableDnamtColumns = [
      {
        header: '筆數',
        field: 'no',
        sortable: false,
        numberField: true,
      },
      {
        header: '借入日期',
        field: 'brdate',
        sortable: false,
      },
      {
        header: '股票代碼',
        field: 'stock',
        sortable: false,
      },
      {
        header: '借券書號',
        field: 'dseq',
        sortable: false,
      },
      {
        header: '存入日期',
        field: 'sdate',
        sortable: false,
      },
      {
        header: '擔保品型態',
        field: 'dntypenm',
        sortable: false,
      },
      {
        header: '折合擔保金',
        field: 'dnamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '未還金額',
        field: 'bdnamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '存入屬類',
        field: 'stypenm',
        sortable: false,
      },
    ];
    this.tableReplyColumns = [
      {
        header: '筆數',
        field: 'no',
        sortable: false,
        numberField: true,
      },
      {
        header: '借入日期',
        field: 'brdate',
        sortable: false,
      },
      {
        header: '股票代碼',
        field: 'stock',
        sortable: false,
      },
      {
        header: '借券書號',
        field: 'dseq',
        sortable: false,
      },
      {
        header: '沖銷日期',
        field: 'rpdate',
        sortable: false,
      },
      {
        header: '沖銷方式',
        field: 'rptypenm',
        sortable: false,
      },
      {
        header: '還券股數',
        field: 'Cqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '借券費',
        field: 'Dbfee',
        sortable: false,
        numberField: true,
      },
      {
        header: '借券手續費',
        field: 'Brfee',
        sortable: false,
        numberField: true,
      },
      {
        header: '服務費',
        field: 'Fee',
        sortable: false,
        numberField: true,
      },
      {
        header: '沖銷現金擔保金額',
        field: 'Cdnamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '擔保金利息',
        field: 'Dnint',
        sortable: false,
        numberField: true,
      },
      {
        header: '代扣利息稅款',
        field: 'Dninttax',
        sortable: false,
        numberField: true,
      },
      {
        header: '應收付金額',
        field: 'netamt',
        sortable: false,
        numberField: true,
      },
    ];
  }

  // 預設 bdate(查詢起日)跟 edate(查詢迄日)日期
  private setFormValue(): void {
    const today = new Date();

    // edate 為今日
    const endtOfDay = new Date(today);
    this.formGroup.get('edate')?.setValue(endtOfDay);

    // ddate 為三個月前的日期
    const threeMonthsBefore = new Date();
    threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
    this.formGroup.get('bdate')?.setValue(threeMonthsBefore);
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

  doQuery() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    // 查詢先清空
    this.expendRows = [];
    this.tableData = [];
    this.selectedRowIndex = null;

    const { bdate, edate, stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      bdate: this.datePipe.transform(bdate, 'yyyyMMdd') ?? '', //20240314
      edate: this.datePipe.transform(edate, 'yyyyMMdd') ?? '', //20240318
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
    // 改為 已查詢
    this.hasSearched = true;
    this.borrowedStockQueryService
      .getBorrowedStockQueryData(this.searchParams)
      .subscribe({
        next: (response) => {
          // 資料查詢時間
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          if (Array.isArray(response)) {
            this.tableData = response.map((item, index) => ({
              ...item,
              brdate: this.tranferColumnService.dateChange(item.brdate),
              edate: this.tranferColumnService.dateChange(item.edate),
              uuid: index,
            }));
            // console.log('this.tableData', this.tableData);
            this.isSortable();
          } else {
            this.tableData = [];
            this.systemMessageService.error(response);
          }
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.tableData = [];
          this.expendRows = [];
          this.loadingMaskService.hide();
        },
      });
  }

  // 點選 table 資料觸發打API，取得子層資料
  viewDetails(rowData: BorrowedStockQueryResponse, rowIndex: number): void {
    if (!this.expendRows[rowData.uuid]) {
      // console.log(this.expendRows[rowData.uuid]);
      return;
    }

    // 第一次查詢的參數(formgroup)
    const { APISERVER, sid, sip, Invscode, comp, bhno, cseq, stock } =
      this.searchParams;
    // 從查詢結果找[借入日期]及[借券書號]
    const { brdate, dseq } = rowData;
    // [借入日期]轉換格式
    const formattedBrdate = this.datePipe.transform(brdate, 'yyyyMMdd') ?? '';
    const params: BorrowedDnamtQueryRequest = {
      APISERVER,
      sid,
      sip,
      Invscode,
      comp,
      bhno,
      cseq,
      stock,
      brdate: formattedBrdate,
      dseq,
    };

    // 查詢擔保品
    this.borrowedStockQueryService.getBorrowedStockDnamtData(params).subscribe({
      next: (details) => {
        this.updateTableData(params, details, 'dnamtDetails', rowIndex);
        // console.log('tableDnamtData', this.tableDnamtData);
        this.loadingMaskService.hide();
      },
      error: () => {
        this.tableDnamtData = [];
        this.loadingMaskService.hide();
      },
    });
    // 查詢償還明細
    this.borrowedStockQueryService.getBorrowedStockReplyData(params).subscribe({
      next: (reply) => {
        this.updateTableData(params, reply, 'replyDetails', rowIndex);
        // console.log('tableReplyData', this.tableReplyData);
        this.loadingMaskService.hide();
      },
      error: () => {
        this.tableReplyData = [];
        this.loadingMaskService.hide();
      },
    });
  }
  // 帶入對應資料
  private updateTableData(
    params: BorrowedDnamtQueryRequest,
    data: any,
    dataType: 'dnamtDetails' | 'replyDetails',
    rowIndex: number,
  ): void {
    // 找對應資料行
    const selectedRowIndex = this.tableData.findIndex(
      (item) =>
        this.datePipe.transform(item.brdate, 'yyyyMMdd') === params.brdate &&
        item.dseq === params.dseq,
    );
    // 倘沒有找到和 brdate 和 dseq 匹配的行，就會回-1
    if (selectedRowIndex !== -1) {
      this.tableData[selectedRowIndex][dataType] = data;
      if (dataType === 'dnamtDetails') {
        this.tableData[selectedRowIndex].dnamtDetails = data.map(
          (item: { brdate: string; sdate: string }) => ({
            ...item,
            brdate: this.tranferColumnService.dateChange(item.brdate),
            sdate: this.tranferColumnService.dateChange(item.sdate),
          }),
        );
      } else if (dataType === 'replyDetails') {
        this.tableData[selectedRowIndex].replyDetails = data.map(
          (item: { brdate: string; rpdate: string }) => ({
            ...item,
            brdate: this.tranferColumnService.dateChange(item.brdate),
            rpdate: this.tranferColumnService.dateChange(item.rpdate),
          }),
        );
      }
    }
  }

  // 清除與重置
  onClear(): void {
    this.formGroup.reset(); // 重置表單
    this.tableData = []; // 清除 table
    this.expendRows = [];
    this.isSortable(); // 移除排序
    this.setFormValue(); // 還原預設日期
    this.hasSearched = false; // 重置查詢狀態
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.queryTime = ''; // 重製查詢時間
  }

  // onRowExpand(e: any) {
  //   console.log(e);
  //   console.log(this.expendRows);
  // }

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
      '查詢起日',
      '查詢迄日',
    ];
    // 查詢條件資料
    const { APISERVER, bhno, cseq, stock, stockName, bdate, edate } =
      this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換查詢帳中API主機
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stockName || '',
      bdate || '',
      edate || '',
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備 table header 資料
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const exportData = this.tableData.map((tableData, index) => {
      const stringArr = [
        tableData.no,
        tableData.brdate,
        tableData.edate,
        tableData.stock,
        tableData.stocknm,
        tableData.dseq,
        tableData.rate,
        tableData.qty,
        tableData.bqty,
        tableData.dnamt,
        tableData.keeprate,
        tableData.dbfee,
        tableData.brfee,
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

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  // 不包含合計資料
  get FilterData(): BorrowedStockQueryResponse[] {
    return this.tableData.filter((item) => item.no !== '合計');
  }

  // 合計資料
  get FilterTotalData(): BorrowedStockQueryResponse[] {
    return this.tableData.filter((item) => item.no === '合計');
  }

  // 取表單的值
  formControl(formControlName: string): FormControl {
    return this.formGroup.get(formControlName) as FormControl;
  }

  // 表單的值若為空值，顯示紅框警告
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || formControl.touched)
      : false;
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort =
      this.tableData.filter((data) => data.no !== '合計').length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.borrowedStockQueryTable) {
      this.borrowedStockQueryTable.reset();
    }
  }

  // 錯誤訊息提示
  showErrorMessage(name: string): string {
    let formControl = this.formGroup.get(name);
    let errorMessage: string = '';
    if (formControl?.valid) {
      errorMessage = '';
    } else if (formControl?.errors?.['required']) {
      errorMessage = `此欄位必須輸入`;
    }
    return errorMessage;
  }
}
