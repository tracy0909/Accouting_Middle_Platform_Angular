import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { ExcelTableList } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { SearchParamsExcel } from '../../models/search-params-excel.model';
import { SearchParams } from '../../models/search-params.model';
import { SummaryDetail } from '../../models/summary-detail.model';
import { TypeOption } from '../../models/type-option.model';
import { MaintRateSummaryQueryService } from '../../services/maint-rate-summary-query.service';

@Component({
  selector: 'app-maint-rate-summary-query',
  templateUrl: './maint-rate-summary-query.component.html',
  styleUrls: ['./maint-rate-summary-query.component.scss'],
})
export class MaintRateSummaryQueryComponent extends BaseComponent {
  information = {
    accmrate: '',
    crlimit: '',
    dblimit: '',
  };
  @ViewChild('tableCopmonent') tableCopmonent!: Table; // 表格組件
  typeOptions!: TypeOption[];
  visible: boolean = false;
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '維持率彙總明細查詢'; // 頁面標題名稱
  summaryDetails: SummaryDetail[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  /** 紀錄下載查詢條件 */
  searchParams!: SearchParams;
  tableColumns: TableColumn[] = [
    {
      header: '類別',
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
      header: '留存股數',
      field: 'bqty',
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
      header: '現價',
      field: 'lprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '融資餘額',
      field: 'bcramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '擔保品餘額',
      field: 'bdnamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '保證金餘額',
      field: 'bgtamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '保證品價值',
      field: 'agpamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '抵繳折合',
      field: 'collateral',
      sortable: false,
      numberField: true,
    },
    {
      header: '維持率%',
      field: 'keeprate',
      sortable: false,
      numberField: true,
    },
    {
      header: '信用種類',
      field: 'sftype',
      sortable: false,
    },
    {
      header: '成交日期',
      field: 'tdate',
      sortable: false,
    },
    {
      header: '委託書號',
      field: 'dseq',
      sortable: false,
    },
  ];

  constructor(
    private excelExportService: ExcelExportService,
    private maintRateSummaryQueryService: MaintRateSummaryQueryService,
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
    this.summaryDetails = [];
    this.information.accmrate = '';
    this.information.crlimit = '';
    this.information.dblimit = '';
    const { stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      type: this.formGroup.get('type')?.getRawValue().value,
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
    this.maintRateSummaryQueryService.getKeepRate(this.searchParams).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (typeof response !== 'string' && Array.isArray(response.details)) {
          this.summaryDetails = this.transColumnValue(response.details);
          this.information.accmrate = response.root[0].accmrate;
          this.information.crlimit = response.root[0].crlimit;
          this.information.dblimit = response.root[0].dblimit;
          this.hasSearched = true; // 設置為已查詢
        } else {
          this.systemMessageService.error(response as string);
        }
        this.loadingMaskService.hide();
        this.isSortable();
      },
      error: (error) => {
        this.summaryDetails = [];
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
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.summaryDetails = []; // 清除 table
    this.information.accmrate = '';
    this.information.crlimit = '';
    this.information.dblimit = '';
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
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const exportData = this.summaryDetails.map((summaryDetail, index) => {
      const stringArr = [
        summaryDetail.ttypename,
        summaryDetail.stock,
        summaryDetail.stocknm,
        summaryDetail.bqty,
        summaryDetail.price,
        summaryDetail.lprice,
        summaryDetail.bcramt,
        summaryDetail.bdnamt,
        summaryDetail.bgtamt,
        summaryDetail.agpamt,
        summaryDetail.collateral,
        summaryDetail.keeprate,
        summaryDetail.sftype,
        summaryDetail.tdate,
        summaryDetail.dseq,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }

  // 設定表單日期初始值的方法
  private setFormValue(): void {
    this.formGroup.get('type')?.setValue(this.typeOptions[0]);
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
    const isSort = this.summaryDetails.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.tableCopmonent) {
      this.tableCopmonent.reset();
    }
  }
}
