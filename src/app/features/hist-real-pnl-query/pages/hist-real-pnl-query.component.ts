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
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { ExcelTableList, SearchParam } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { HistRealPnlQueryRequest } from '../models/hist-real-pnl-query-request.model';
import { HistRealPnlQueryResponse } from '../models/hist-real-pnl-query-response.model';
import { HistRealPnlQueryService } from '../services/hist-real-pnl-query.service';

@Component({
  selector: 'app-hist-real-pnl-query',
  templateUrl: './hist-real-pnl-query.component.html',
  styleUrls: ['./hist-real-pnl-query.component.scss'],
})
export class HistRealPnlQueryComponent extends BaseComponent {
  // 頁面標題名稱
  readonly titleName = '歷史已實現損益總計查詢';
  // Table
  @ViewChild('histRealPnlQueryTable') histRealPnlQueryTable!: Table;
  @ViewChild('histRealPnlQueryStmtTable') histRealPnlQueryStmtTable!: Table;
  // 輸入表單的 FormGroup，在 initFormGroup() 初始化
  formGroup!: FormGroup;
  // 表格資料
  tableData: HistRealPnlQueryResponse[] = [];
  // Table 的欄位設定
  tableColumns: TableColumn[] = [];
  // 明細 Table 的欄位設定
  detailTableColumns: TableColumn[] = [];
  // 查詢帳中API主機 下拉選單選項
  apiServerOptions: Option[] = [];
  // 分公司 下拉選單選項
  branchOptions: Option[] = [];
  // 紀錄下載查詢條件
  searchParams!: HistRealPnlQueryRequest;
  // 資料查詢時間
  queryTime: string | null = null;
  // 是否已進行查詢
  hasSearched: boolean = false;
  // 權限
  buttonList!: ButtonList;
  // 是否開啟計算方式 dialog
  visible: boolean = false;

  // TODO 交易類別、幣別之後改API
  // 交易類別 下拉選單的 Options 資料
  transactionTypeOptions: Option[] = [
    { id: 'A', label: '全部', value: 'A' },
    { id: '0', label: '現股', value: '0' },
    { id: '1', label: '融資', value: '1' },
    { id: '2', label: '融券', value: '2' },
    { id: 'R', label: '興櫃', value: 'R' },
    { id: '3', label: '現沖', value: '3' },
  ];
  // 幣別 下拉選單的 Options 資料
  currencyTypeOptions: Option[] = [
    { id: 'A', label: '全部', value: 'A' },
    { id: 'NTD', label: '台幣', value: 'NTD' },
    { id: 'CNY', label: '人民幣', value: 'CNY' },
  ];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private histRealPnlQueryService: HistRealPnlQueryService,
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
      bdate: ['', Validators.required],
      edate: ['', Validators.required],
      ttype: ['A'],
      ctype: ['A'],
      action1: [false],
      action4: [false],
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
        header: '合計買進金額',
        field: 'bcost',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計賣出金額',
        field: 'scost',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計總成交金額',
        field: 'netmamt',
        sortable: false,
      },
      {
        header: '合計總成交金額（不扣除稅費）',
        field: 'mamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計已實現損益',
        field: 'profit',
        sortable: false,
        numberField: true,
      },

      {
        header: '合計手續費',
        field: 'fee',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計交易稅',
        field: 'tax',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計除息金',
        field: 'divamt',
        sortable: false,
        numberField: true,
      },
    ];
    this.detailTableColumns = [
      {
        header: '合計買進金額',
        field: 'cm_bamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計賣出金額',
        field: 'cm_samt',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計總成交金額（不扣除稅費）',
        field: 'cm_mamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計總成交金額',
        field: 'cm_netmamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計手續費',
        field: 'cm_fee',
        sortable: false,
        numberField: true,
      },
      {
        header: '合計交易稅',
        field: 'cm_tax',
        sortable: false,
        numberField: true,
      },
    ];
  }

  // 查詢
  doQuery() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    // 查詢前先清空 table
    this.tableData = [];
    const { bdate, edate, stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      action: this.actionData,
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
    // console.log('searchParams', this.searchParams);
    this.loadingMaskService.show();
    // 改為 已查詢
    this.hasSearched = true;
    this.histRealPnlQueryService
      .getHistRealPnlQueryData(this.searchParams)
      .subscribe({
        next: (response) => {
          // 資料查詢時間
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          if (Array.isArray(response)) {
            this.tableData = response;
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

  // 清除
  onClear(): void {
    this.formGroup.reset(); // 重置表單
    this.tableData = []; // 清除 table
    this.isSortable(); // 移除排序
    this.hasSearched = false; // 重置查詢狀態
    this.setFormValue();
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.formGroup.get('ttype')?.setValue(this.transactionTypeOptions[0].value);
    this.formGroup.get('ctype')?.setValue(this.currencyTypeOptions[0].value);
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
      '帳號',
      '股票代碼',
      '股票名稱',
      '交易類別',
      '幣別',
      '起始日期',
      '結束日期',
      '濾除買進成本為0的股票',
      '不計除息金',
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
      action1,
      action4,
    } = this.searchParams;
    // console.log(this.searchParams);

    const paramData = [
      this.getDatabase(APISERVER), // 轉換查詢帳中API主機
      this.getBranchLabel(bhno), // 轉換分公司
      cseq,
      stock || '',
      stockName || '',
      this.getTtypeLabel(ttype), // 轉換交易類別
      this.getCtypeLabel(ctype), // 轉換幣別
      bdate,
      edate,
      action1 ? '✔' : '✘', //下載Excel，若為true，則Excel有打✔圖示，反之為打✘
      action4 ? '✔' : '✘',
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    // 已實現損益資料
    const exportData = this.tableData.map((tableData) => {
      const stringArr = [
        tableData.bcost,
        tableData.scost,
        tableData.netmamt,
        tableData.mamt,
        tableData.profit,
        tableData.fee,
        tableData.tax,
        tableData.divamt,
      ];
      return [...stringArr];
    });

    // 對帳單資料
    const detailTableHeader = this.detailTableColumns.map(
      (column) => column.header,
    );
    const detailTabletData = this.tableData.map((tableData) => {
      const stringArr = [
        tableData.cm_bamt,
        tableData.cm_samt,
        tableData.cm_mamt,
        tableData.cm_netmamt,
        tableData.cm_fee,
        tableData.cm_tax,
      ];
      return [...stringArr];
    });
    return [
      { tableHeader: tableHeader, tableData: exportData },
      { tableHeader: detailTableHeader, tableData: detailTabletData },
    ];
  }

  // 下載Excel共用，轉下拉選單顯示值
  private getLabelFromOptions(
    options: { id: string; value: string; label: string }[],
    value: string,
  ): string {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  }

  // 查詢帳中API主機
  private getDatabase(value: string): string {
    return this.getLabelFromOptions(this.apiServerOptions, value);
  }

  // 分公司
  private getBranchLabel(value: string): string {
    return this.getLabelFromOptions(this.branchOptions, value);
  }

  // 交易類別
  private getTtypeLabel(value: string): string {
    return this.getLabelFromOptions(this.transactionTypeOptions, value);
  }

  // 幣別
  private getCtypeLabel(value: string): string {
    return this.getLabelFromOptions(this.currencyTypeOptions, value);
  }

  // 預設 bdate(起始日期)跟 edate(結束日期)日期
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

  // Excel 檔名
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

  // 轉checkbox參數用，濾除買進成本為0的股票為1，不計除息金為4，若為true則轉為 1 or 4
  // 兩個皆為true則 1 + 4 = 5
  get actionData(): string {
    const action1Value = this.formGroup.get('action1')?.value ? 1 : 0;
    const action4Value = this.formGroup.get('action4')?.value ? 4 : 0;
    return (action1Value + action4Value).toString();
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.histRealPnlQueryTable && this.histRealPnlQueryStmtTable) {
      this.histRealPnlQueryTable.reset();
      this.histRealPnlQueryStmtTable.reset();
    }
  }

  // 計算方式 dialog
  showDialog(): void {
    this.visible = true;
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
