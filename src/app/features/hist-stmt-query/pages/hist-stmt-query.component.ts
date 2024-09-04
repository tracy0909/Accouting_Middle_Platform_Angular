import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { Option } from '../../../shared/models/option.model';
import { CreditInfoCompilation } from '../models/credit-info-compilation.model';
import { HistStmtQueryRequest } from '../models/hist-stmt-query-request.model';
import { HistoricalStatementDetailsPartial } from '../models/historical-statement-details-partial.model';
import { HistoricalStatementSummary } from '../models/historical-statement-summary.model';
import { SearchParams } from '../models/search-params ';
import { SettlementFundInformation } from '../models/settlement-fundInformation.model';
import { TableColumnData } from '../models/table-column';
import { HistStmtQueryService } from '../service/hist-stmt-query.service';

@Component({
  selector: 'app-hist-stmt-query',
  templateUrl: './hist-stmt-query.component.html',
  styleUrls: ['./hist-stmt-query.component.scss'],
  providers: [DatePipe],
})
export class HistStmtQueryComponent extends BaseComponent {
  @ViewChild('tableHitorical') tableHitorical!: Table;
  readonly titleName = '歷史對帳單查詢'; // 頁面標題名稱
  queryForm!: FormGroup; // 表單組對象 !: FormGroup; // 表單組對象
  CreditInformationSummaryTableColumns: TableColumn[] = []; // 表格列數組
  SettlementFundInformationTableColumns: TableColumn[] = []; // 表格列數組
  HistoricalStatementSummaryTableColumns: TableColumn[] = []; // 表格列數組
  HistoricalStatementDetailsPartialTableColumns: TableColumn[] = []; // 表格列數組
  historicalStatementDetailsDetailedTableColumns: TableColumn[] = []; // 表格列數組
  creditInformationSummaryTableData: CreditInfoCompilation[] = [];
  settlementFundInformationTableData: SettlementFundInformation[] = [];
  historicalStatementSummaryTableData: HistoricalStatementSummary[] = [];
  historicalStatementDetailsPartialTableData: HistoricalStatementDetailsPartial[] =
    [];
  submitted = false; // 表單提交狀態標誌
  searchParams!: HistStmtQueryRequest;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  options: Option[] = []; // 動態下拉選單的 Options 資料
  buttonList!: ButtonList;
  queryTime: string | null = null; // 資料查詢時間

  transactionTypeOptions: Option[] = [
    { id: 'A', label: '全部', value: 'A' },
    { id: '0', label: '現股', value: '0' },
    { id: '1', label: '融資', value: '1' },
    { id: '2', label: '融券', value: '2' },
    { id: 'R', label: '興櫃', value: 'R' },
  ]; // 交易類別下拉選單的 Options 資料
  currencyTypeOptions: Option[] = [
    { id: 'A', label: '全部', value: 'A' },
    { id: 'NTD', label: '台幣', value: 'NTD' },
    { id: 'CNY', label: '人民幣', value: 'CNY' },
  ]; // 幣別下拉選單的 Options 資料

  constructor(
    private datePipe: DatePipe,
    private histStmtQueryService: HistStmtQueryService,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
    private stockSuggestionsService: StockSuggestionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單組
    this.initTableColumns(); // 初始化表格列
    this.setOptions(); // 初始化下拉式選單
    this.setFormValue();
    const { bdate, edate } = this.queryForm.value;
    this.searchParams = {
      ...this.queryForm.value,
      APISERVER: '',
      bhno: '',
      cseq: '',
      stock: '',
      ttype: '',
      ctype: '',
      bdate: this.datePipe.transform(bdate, 'yyyyMMdd') ?? '', //20240314
      edate: this.datePipe.transform(edate, 'yyyyMMdd') ?? '', //20240318
    };
    this.buttonList = this.authButtonList;
  }

  /**
   * 初始化表單
   */
  initFormGroup(): void {
    this.queryForm = this.formBuilder.nonNullable.group({
      APISERVER: ['', Validators.required],
      bhno: ['', Validators.required],
      cseq: ['', [Validators.maxLength(7), Validators.required]],
      stock: [''],
      stockName: [''],
      ttype: ['A'],
      ctype: ['A'],
      bdate: [''],
      edate: [''],
    });
    if (this.queryForm.contains('APISERVER')) {
      this.queryForm.patchValue(this.getUserInfoDefaultParams());
    }

    this.queryForm.get('stockName')?.disable();
  }
  /**
   * 初始化表格列
   */
  initTableColumns(): void {
    this.CreditInformationSummaryTableColumns = [
      {
        header: '合計融資市值',
        field: 'crmarketvalue',
        numberField: true,
      },
      {
        header: '合計融券市值',
        field: 'dbmarketvalue',
        numberField: true,
      },
      {
        header: '合計擔保品',
        field: 'dnamt',
        numberField: true,
      },
      {
        header: '剩餘融資額度',
        field: 'crlimit',
        numberField: true,
      },
      {
        header: '剩餘融券額度',
        field: 'dblimit',
        numberField: true,
      },
      {
        header: '合計融券保證金',
        field: 'gtamt',
        numberField: true,
      },
      {
        header: '合計融資金額',
        field: 'cramt',
        numberField: true,
      },
      {
        header: '合計融券金額',
        field: 'dbamt',
        numberField: true,
      },
      {
        header: '整戶維持率',
        field: 'accmrate',
        numberField: true,
      },
      {
        header: '昨收整戶維持率',
        field: 'accmrate_y',
        numberField: true,
      },
    ];
    this.SettlementFundInformationTableColumns = [
      {
        header: '今日交割金額',
        field: 'settlement_t',
        numberField: true,
      },
      {
        header: '昨日交割金額',
        field: 'settlement_y',
        numberField: true,
      },
      {
        header: '交割金額Net',
        field: 'settlement_net',
        numberField: true,
      },
    ];
    this.HistoricalStatementSummaryTableColumns = [
      {
        header: '合計淨收金額',
        field: 'income',
        numberField: true,
      },
      {
        header: '合計淨付金額',
        field: 'cost',
        numberField: true,
      },
      {
        header: '合計淨收付',
        field: 'netamt',
        numberField: true,
      },
      {
        header: '合計手續費',
        field: 'fee',
        numberField: true,
      },
      {
        header: '合計交易稅',
        field: 'tax',
        numberField: true,
      },
      {
        header: '合計當沖損益',
        field: 'cdamt',
        numberField: true,
      },
    ];
    this.HistoricalStatementDetailsPartialTableColumns = [
      {
        header: '筆數',
        field: 'no',
        sortable: true,
        numberField: true,
      },
      {
        header: '交易日',
        field: 'tdate',
        sortable: true,
        dateField: true,
      },
      {
        header: '委託書號',
        field: 'dseq',
        sortable: true,
      },
      {
        header: '股票代號',
        field: 'stock',
        sortable: true,
      },
      {
        header: '股票名稱',
        field: 'stocknm',
        sortable: true,
      },
      {
        header: '異動別',
        field: 'wtype',
        sortable: true,
      },
      {
        header: '委託別',
        field: 'ttype',
        sortable: true,
      },
      {
        header: '買賣別',
        field: 'bstype',
        sortable: true,
      },
      {
        header: '單價',
        field: 'price',
        sortable: true,
        numberField: true,
      },
      {
        header: '股數',
        field: 'qty',
        sortable: true,
        numberField: true,
      },
      {
        header: '價金',
        field: 'amt',
        sortable: true,
        numberField: true,
      },
      {
        header: '手續費',
        field: 'fee',
        sortable: true,
        numberField: true,
      },
      {
        header: '交易稅',
        field: 'tax',
        sortable: true,
        numberField: true,
      },
      {
        header: '淨收付',
        field: 'netamt',
        sortable: true,
        numberField: true,
      },
      {
        header: '融券手續費',
        field: 'dbfee',
        sortable: true,
        numberField: true,
      },
      {
        header: '融資金額/融券保證金',
        field: 'cramt',
        sortable: true,
        numberField: true,
      },
      {
        header: '融券擔保品',
        field: 'dnamt',
        sortable: true,
        numberField: true,
      },
      {
        header: '融資利息/融券保證金利息',
        field: 'crint',
        sortable: true,
        numberField: true,
      },
      {
        header: '擔保品利息',
        field: 'dnint',
        sortable: true,
        numberField: true,
      },
      {
        header: '幣別',
        field: 'currency',
        sortable: true,
      },
    ];
    this.historicalStatementDetailsDetailedTableColumns = [
      {
        header: '筆數',
        field: 'no',
        numberField: true,
      },
      {
        header: '交易日',
        field: 'tdate',
        dateField: true,
      },
      {
        header: '委託書號',
        field: 'dseq',
      },
      {
        header: '分單號',
        field: 'dno',
      },
      {
        header: '股票代號',
        field: 'stock',
      },
      {
        header: '股票名稱',
        field: 'stocknm',
      },
      {
        header: '異動別',
        field: 'wtype',
      },
      {
        header: '委託別',
        field: 'ttype',
      },
      {
        header: '交易別',
        field: 'etype',
      },
      {
        header: '買賣別',
        field: 'bstype',
      },
      {
        header: '單價',
        field: 'price',
        numberField: true,
      },
      {
        header: '股數',
        field: 'qty',
        numberField: true,
      },
      {
        header: '價金',
        field: 'amt',
        numberField: true,
      },
      {
        header: '手續費',
        field: 'fee',
        numberField: true,
      },
      {
        header: '交易稅',
        field: 'tax',
        numberField: true,
      },
      {
        header: '證所稅',
        field: 'stintax',
        numberField: true,
      },
      {
        header: '健保補充費',
        field: 'healthfee',
        numberField: true,
      },
      {
        header: '債息',
        field: 'rvint',
        numberField: true,
      },
      {
        header: '淨收付',
        field: 'netamt',
        numberField: true,
      },
      {
        header: '融券手續費',
        field: 'dbfee',
        numberField: true,
      },
      {
        header: '融資金額/融券保證金',
        field: 'cramt',
        numberField: true,
      },
      {
        header: '融券擔保品',
        field: 'dnamt',
        numberField: true,
      },
      {
        header: '融資利息/融券保證金利息',
        field: 'crint',
        numberField: true,
      },
      {
        header: '擔保品利息',
        field: 'dnint',
        numberField: true,
      },
      {
        header: '標借券費',
        field: 'dlfee',
        numberField: true,
      },
      {
        header: '標借券費利息',
        field: 'bfint',
        numberField: true,
      },
      {
        header: '逾期手續費',
        field: 'obamt',
        numberField: true,
      },
      {
        header: '代扣所得稅',
        field: 'intax',
        numberField: true,
      },
      {
        header: '幣別',
        field: 'currency',
      },
    ];
    this.isSortable();
  }

  doQuery() {
    this.submitted = true;

    // 檢查表單是否有效
    if (this.queryForm.invalid) {
      return;
    }

    const { bdate, edate, stock } = this.queryForm.value;
    this.searchParams = {
      ...this.queryForm.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      Qtype: 'hisstatement',
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
    this.hasSearched = true; // 設置為已查詢
    this.loadingMaskService.show();
    // console.log(this.searchParams);
    this.histStmtQueryService.getHisstatement(this.searchParams).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        this.loadingMaskService.hide();

        let validResponse = true;

        // 信用資訊彙總
        if (Array.isArray(response.creditsum)) {
          this.creditInformationSummaryTableData = response.creditsum;
          // console.log(response.profiles);
        } else {
          validResponse = false;
        }

        // 交割金資訊
        if (Array.isArray(response.settlementinfo)) {
          this.settlementFundInformationTableData = response.settlementinfo;
          // console.log(response.settlementinfo);
        } else {
          validResponse = false;
        }

        // 歷史對帳單彙總
        if (Array.isArray(response.root)) {
          // console.log(response.root)
          this.historicalStatementSummaryTableData = response.root;
        } else {
          validResponse = false;
        }

        // 歷史對帳單明細（部分）
        if (Array.isArray(response.profile)) {
          this.historicalStatementDetailsPartialTableData = response.profile;
          // console.log('response.profile');
          // console.log(response.profile);
          this.isSortable();
        } else {
          validResponse = false;
        }

        if (!validResponse) {
          this.systemMessageService.error(response);
          this.creditInformationSummaryTableData = [];
          this.settlementFundInformationTableData = [];
          this.historicalStatementSummaryTableData = [];
          this.historicalStatementDetailsPartialTableData = [];
        }
      },
      error: () => {
        this.creditInformationSummaryTableData = [];
        this.settlementFundInformationTableData = [];
        this.historicalStatementSummaryTableData = [];
        this.historicalStatementDetailsPartialTableData = [];
      },
    });

    // console.log('this.searchParams', this.searchParams);
  }

  /**
   * 清除表單並重置
   */
  onClearForm(): void {
    this.queryForm.reset(); // 清空表單
    this.setFormValue(); // 設置表單初始值
    this.queryForm.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.queryForm.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.hasSearched = false; // 重置搜尋狀態
    this.submitted = false; // 重置提交狀態
    // 清空表格數據
    this.creditInformationSummaryTableData = [];
    this.settlementFundInformationTableData = [];
    this.historicalStatementSummaryTableData = [];
    this.historicalStatementDetailsPartialTableData = [];
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
  private getSearchParams(): SearchParams {
    // 查詢條件
    const paramHeadr = [
      '資料庫別',
      '分公司',
      '客戶帳號',
      '股票代碼',
      '股票名稱',
      '交易類別',
      '幣別',
      '起始日期',
      '結束日期',
    ];
    // 查詢條件資料
    const {
      APISERVER,
      bhno,
      cseq,
      stock,
      stockName,
      ttype,
      ctype,
      bdate,
      edate,
    } = this.searchParams;
    // console.log(this.searchParams);
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stockName || '',
      this.getOptionLabel(this.transactionTypeOptions, ttype), // 轉換交易类别
      this.getOptionLabel(this.currencyTypeOptions, ctype), // 轉換幣别
      this.tranferColumnService.dateChange(bdate),
      this.tranferColumnService.dateChange(edate),
    ];

    // console.log(paramData);
    return { paramHeadr, paramData };
  }

  get getExportFileName(): string {
    const { bhno, cseq } = this.searchParams;
    return `${this.titleName}_${bhno}_${cseq}`;
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.queryForm.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.queryForm.get('stockName') as FormControl;
  }
  /**
   * 設置動態下拉選單的 Options 資料
   */
  setOptions(): void {
    this.optionService.branchOfficesDbSourceOptions().subscribe({
      next: (branchOptions) => {
        this.branchOptions = branchOptions;
        const { bhno, cseq } = this.getDefaultParams();
        let bhnoValue =
          !bhno && this.branchOptions.length > 0
            ? this.branchOptions[0].value
            : bhno;
        this.queryForm.patchValue({ bhno: bhnoValue, cseq });
      },
    });
    this.optionService.getAPIServerOptions().subscribe({
      next: (options) => {
        this.options = options;
      },
    });
  }

  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getOptionLabel(options: Option[], id: string): string {
    const option = options.find((opt) => opt.id === id);
    return option ? option.label : id;
  }

  private getExcelTableList(): TableColumnData[] {
    const creditInfoTableHeader = this.CreditInformationSummaryTableColumns.map(
      (column) => column.header,
    );

    const creditInfoExportData = this.creditInformationSummaryTableData.map(
      (data) => {
        const stringArr = [
          data.crmarketvalue,
          data.dbmarketvalue,
          data.dnamt,
          data.crlimit,
          data.dblimit,
          data.gtamt,
          data.cramt,
          data.dbamt,
          data.accmrate,
          data.accmrate_y,
        ];
        return [...stringArr];
      },
    );

    const settlementFundTableHeader =
      this.SettlementFundInformationTableColumns.map((column) => column.header);

    const settlementFundExportData =
      this.settlementFundInformationTableData.map((data) => {
        const stringArr = [
          data.settlement_t,
          data.settlement_y,
          data.settlement_net,
        ];
        return [...stringArr];
      });

    const historicalSummaryTableHeader =
      this.HistoricalStatementSummaryTableColumns.map(
        (column) => column.header,
      );

    const historicalSummaryExportData =
      this.historicalStatementSummaryTableData.map((data) => {
        const stringArr = [
          data.income,
          data.cost,
          data.netamt,
          data.fee,
          data.tax,
          data.cdamt,
        ];
        return [...stringArr];
      });

    const partialDetailsTableHeader =
      this.HistoricalStatementDetailsPartialTableColumns.map(
        (column) => column.header,
      );

    const partialDetailsExportData =
      this.historicalStatementDetailsPartialTableData.map((data) => {
        const stringArr = [
          data.no,
          data.tdate,
          data.dseq,
          data.stock,
          data.stocknm,
          data.wtype,
          data.ttype,
          data.bstype,
          data.price,
          data.qty,
          data.amt,
          data.fee,
          data.tax,
          data.netamt,
          data.dbfee,
          data.cramt,
          data.dnamt,
          data.crint,
          data.dnint,
          data.currency,
        ];
        return [...stringArr];
      });

    return [
      { tableHeader: creditInfoTableHeader, tableData: creditInfoExportData },
      {
        tableHeader: settlementFundTableHeader,
        tableData: settlementFundExportData,
      },
      {
        tableHeader: historicalSummaryTableHeader,
        tableData: historicalSummaryExportData,
      },
      {
        tableHeader: partialDetailsTableHeader,
        tableData: partialDetailsExportData,
      },
    ];
  }

  // 設定表單日期初始值的方法
  private setFormValue(): void {
    const today = new Date(); // 取得目前日期
    const threeMonthsPrior = new Date(today.setMonth(today.getMonth() - 3)); // 取得目前日期的前三個月日期
    this.queryForm.get('edate')?.setValue(new Date()); // 將表單中的結束日期設為目前日期
    this.queryForm.get('bdate')?.setValue(threeMonthsPrior); // 將表單中的開始日期設為前三個月日期
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    // 檢查歷史對帳單明細部分資料是否有內容，如果有內容則允許排序
    const isSort = this.historicalStatementDetailsPartialTableData.length > 1;

    // 遍歷表格列定義，將每個欄位的sortable屬性設定為isSort的值
    this.HistoricalStatementDetailsPartialTableColumns.map(
      (column) => (column.sortable = isSort),
    );

    // 列印isSort的值和表格列定義以供排序
    // console.log(isSort, this.HistoricalStatementDetailsPartialTableColumns);

    // 如果表格存在，重置表格狀態
    if (this.tableHitorical) {
      this.tableHitorical.reset();
    }
  }

  /**
   * 獲取表單控件
   * @param {string} formControlName 表單控件名稱
   * @returns {FormControl} 表單控件
   */
  formControl(formControlName: string): FormControl {
    return this.queryForm.get(formControlName) as FormControl;
  }

  /**
   * 檢查表單控件是否無效
   * @param {string} formControlName 表單控件名稱
   * @returns {boolean} 表單控件是否無效
   */
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.queryForm.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || this.submitted)
      : false;
  }

  getDetailDate(data: string) {
    return this.tranferColumnService.dateChange(data);
  }
}
