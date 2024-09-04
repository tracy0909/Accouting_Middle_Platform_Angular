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
  OffsetCdtd,
  OffsetTdy,
  UnoffsetTdyadd,
  UnoffsetYest,
} from '../models/comprehensive-pnl-query-response.model';
import { ComprehensivePnlQueryRequest } from '../models/comprehensive-pnl-query-resquest.model';
import { ComprehensivePnlQueryService } from '../service/comprehensive-pnl-query.service';

@Component({
  selector: 'app-comprehensive-pnl-query',
  templateUrl: './comprehensive-pnl-query.component.html',
  styleUrls: ['./comprehensive-pnl-query.component.scss'],
})
export class ComprehensivePnlQueryComponent extends BaseComponent {
  @ViewChild('unoffsetYestTableComponent') unoffsetYestTableComponent!: Table;
  @ViewChild('unoffsetTdyaddTableComponent')
  unoffsetTdyaddTableComponent!: Table;
  @ViewChild(' offsetCdtdTableComponent') offsetCdtdTableComponent!: Table;
  @ViewChild(' offsetTdyTableComponent') offsetTdyTableComponent!: Table;
  readonly titleName = '綜合損益查詢';
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  visible: boolean = false;
  buttonList!: ButtonList;
  queryTime: string | null = null; // 資料查詢時間
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  action: number = 0;
  searchParams!: ComprehensivePnlQueryRequest;
  rootTableData: any[] = [];
  unoffsetYestTableData: any[] = [];
  unoffsetTdyaddTableData: any[] = [];
  offsetCdtdTableData: any[] = [];
  offsetTdyTableData: any[] = [];

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

  unoffsetYestTableColumns: TableColumn[] = [
    {
      header: '庫存類別',
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
      header: '昨日剩餘',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '付出成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '成本均價',
      field: 'avgprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '融資金額',
      field: 'bcramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '現價',
      field: 'mprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '融券保證金',
      field: 'bgtamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '現值',
      field: 'namt',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'unreal',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'ur_ratio',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  unoffsetYestTotalTableColumns: TableColumn[] = [
    {
      header: '昨日剩餘',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '付出成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '融資金額',
      field: 'bcramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '融券保證金',
      field: 'bgtamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '現值',
      field: 'namt',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'unreal',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'ur_ratio',
      sortable: false,
      numberField: true,
    },
  ];

  unoffsetTdyaddTableColumns: TableColumn[] = [
    {
      header: '庫存類別',
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
      header: '即時庫存',
      field: 'real_qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '付出成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '成本均價',
      field: 'avgprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '融資金額',
      field: 'bcramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '現價',
      field: 'mprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '融券保證金',
      field: 'bgtamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '現值',
      field: 'namt',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'unreal',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'ur_ratio',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  unoffsetTdyaddTotalTableColumns: TableColumn[] = [
    {
      header: '即時庫存',
      field: 'real_qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '付出成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '融資金額',
      field: 'bcramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '融券保證金',
      field: 'bgtamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '現值',
      field: 'namt',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'unreal',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'ur_ratio',
      sortable: false,
      numberField: true,
    },
  ];

  offsetCdtdTableColumns: TableColumn[] = [
    {
      header: '類別',
      field: 'ttype',
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
      field: 'cqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '買進均價',
      field: 'bprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '賣出均價',
      field: 'sprice',
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
      header: '現價',
      field: 'lastprice',
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
      header: '現值',
      field: 'nowamt',
      sortable: false,
      numberField: true,
    },
    {
      header: '當沖損益',
      field: 'profit',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  offsetCdtdTotalTableColumns: TableColumn[] = [
    {
      header: '數量',
      field: 'cqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '當沖損益',
      field: 'profit',
      sortable: false,
      numberField: true,
    },
  ];

  offsetTdyTableColumns: TableColumn[] = [
    {
      header: '庫存類別',
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
      header: '數量',
      field: 'cqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '成交均價',
      field: 'avgprice',
      sortable: false,
      numberField: true,
    },
    {
      header: '付出均價',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '收入',
      field: 'income',
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
      header: '保證金',
      field: 'gtamt',
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
      header: '損益試算',
      field: 'profit',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'ur_ratio',
      sortable: false,
      numberField: true,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  offsetTdyTotalTableColumns: TableColumn[] = [
    {
      header: '數量',
      field: 'cqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '付出成本',
      field: 'cost',
      sortable: false,
      numberField: true,
    },
    {
      header: '收入',
      field: 'income',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益試算',
      field: 'profit',
      sortable: false,
      numberField: true,
    },
    {
      header: '獲利率',
      field: 'ur_ratio',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private comprehensivePnlQueryService: ComprehensivePnlQueryService,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
    private stockSuggestionsService: StockSuggestionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.buttonList = this.authButtonList;
    this.setOptions();
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      APISERVER: ['', Validators.required],
      bhno: ['', Validators.required],
      cseq: ['', Validators.required],
      stock: [''],
      stockName: [''],
      ttype: ['A'],
      ctype: ['A'],
      excludeTax: [false],
      excludeExDividend: [false],
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }

    this.formGroup.get('stockName')?.disable();
  }

  onSearch(): void {
    this.rootTableData = [];
    this.unoffsetYestTableData = [];
    this.unoffsetTdyaddTableData = [];
    this.offsetCdtdTableData = [];
    this.offsetTdyTableData = [];

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const formValues = this.formGroup.getRawValue();
    const { stockName, ...searchParams } = formValues;
    const { stock } = this.formGroup.value;

    this.searchParams = {
      ...searchParams,
      sid: 'ad',
      sip: this.getUserIP,
      action: this.actionNum,
      comp: '551',
      Invscode: 'TWSE',
      stock: this.stockSuggestionsService.getStockValue(stock),
    };
    this.setDefaultParams(this.searchParams);
    // console.log(searchParams);
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify(this.searchParams),
    };
    this.addUserLogsService.addUserLog(log);
    // console.log(this.searchParams);
    this.loadingMaskService.show();
    this.comprehensivePnlQueryService
      .getComprehensivePnl(this.searchParams)
      .subscribe({
        next: (response) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          this.loadingMaskService.hide();

          let validResponse = true;

          if (
            response &&
            typeof response === 'object' &&
            Array.isArray(response.root)
          ) {
            this.rootTableData = response.root;
          } else if (typeof response === 'string') {
            this.systemMessageService.error(response);
            validResponse = false;
          }

          if (
            response &&
            typeof response === 'object' &&
            Array.isArray(response.unoffset_yests)
          ) {
            this.unoffsetYestTableData = response.unoffset_yests.map(
              (item, index) => ({
                ...item,
                serialNumber: index + 1,
              }),
            );
          } else if (typeof response === 'string') {
            this.systemMessageService.error(response);
            validResponse = false;
          }

          if (
            response &&
            typeof response === 'object' &&
            Array.isArray(response.unoffset_tdyadds)
          ) {
            this.unoffsetTdyaddTableData = response.unoffset_tdyadds.map(
              (item, index) => ({
                ...item,
                serialNumber: index + 1,
              }),
            );
          } else if (typeof response === 'string') {
            this.systemMessageService.error(response);
            validResponse = false;
          }

          if (
            response &&
            typeof response === 'object' &&
            Array.isArray(response.offset_cdtds)
          ) {
            this.offsetCdtdTableData = response.offset_cdtds.map(
              (item, index) => ({
                ...item,
                serialNumber: index + 1,
              }),
            );
          } else if (typeof response === 'string') {
            this.systemMessageService.error(response);
            validResponse = false;
          }

          if (
            response &&
            typeof response === 'object' &&
            Array.isArray(response.offset_tdys)
          ) {
            this.offsetTdyTableData = response.offset_tdys.map(
              (item, index) => ({
                ...item,
                serialNumber: index + 1,
              }),
            );
          } else if (typeof response === 'string') {
            this.systemMessageService.error(response);
            validResponse = false;
          }

          if (!validResponse) {
            this.rootTableData = [];
            this.unoffsetYestTableData = [];
            this.unoffsetTdyaddTableData = [];
            this.offsetCdtdTableData = [];
            this.offsetTdyTableData = [];
          }

          this.hasSearched = true;
          this.isSortable();
        },
        error: (error) => {
          this.rootTableData = [];
          this.unoffsetYestTableData = [];
          this.unoffsetTdyaddTableData = [];
          this.offsetCdtdTableData = [];
          this.offsetTdyTableData = [];
          this.loadingMaskService.hide();
        },
      });
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.rootTableData = [];
    this.unoffsetYestTableData = [];
    this.unoffsetTdyaddTableData = [];
    this.offsetCdtdTableData = [];
    this.offsetTdyTableData = [];
    this.hasSearched = false;
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.queryTime = '';
  }

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
      '交易類別',
      '幣別',
      '不含稅費',
      '不計除息金',
    ];

    // 查詢條件資料
    const {
      APISERVER,
      bhno,
      cseq,
      stock,
      stocknm,
      ttype,
      ctype,
      excludeTax,
      excludeExDividend,
    } = this.searchParams;

    const ttypeLabel =
      this.transactionTypeOptions.find((option) => option.value === ttype)
        ?.label || '';

    const ctypeLabel =
      this.currencyTypeOptions.find((option) => option.value === ctype)
        ?.label || '';

    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stocknm || '',
      ttypeLabel,
      ctypeLabel,
      excludeTax ? '✔' : '✘',
      excludeExDividend ? '✔' : '✘',
    ];

    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    const rootTableHeader = this.rootTableData.flatMap((tableData) => {
      const stringArr = [
        '日結狀態',
        tableData.settle_status,
        tableData.cntddesc,
      ];
      return [...stringArr];
    });

    const unoffsetYestTableHeader = [
      '項次',
      ...this.unoffsetYestTableColumns.map((column) => column.header),
    ];

    const unoffsetTdyaddTableColumns = [
      '項次',
      ...this.unoffsetYestTableColumns.map((column) => column.header),
    ];

    const offsetCdtdTableColumns = [
      '項次',
      ...this.offsetCdtdTableColumns.map((column) => column.header),
    ];

    const offsetTdyTableColumns = [
      '項次',
      ...this.offsetTdyTableColumns.map((column) => column.header),
    ];

    const unoffsetYestExportData = this.unoffsetYestTableData.map(
      (tableData, index, array) => {
        const isLastRow = index === array.length - 1;
        const stringArr = [
          isLastRow ? '合計' : tableData.serialNumber,
          tableData.ttypename,
          tableData.stock,
          tableData.stocknm,
          tableData.qty,
          tableData.cost,
          tableData.avgprice,
          tableData.bcramt,
          tableData.mprice,
          tableData.bgtamt,
          tableData.namt,
          tableData.unreal,
          tableData.ur_ratio,
          tableData.currnm,
          tableData.ioflag,
        ];
        return [...stringArr];
      },
    );

    const unoffsetTdyaddTableData = this.unoffsetTdyaddTableData.map(
      (tableData, index, array) => {
        const isLastRow = index === array.length - 1;
        const stringArr = [
          isLastRow ? '合計' : tableData.serialNumber,
          tableData.ttypename,
          tableData.stock,
          tableData.stocknm,
          tableData.real_qty,
          tableData.cost,
          tableData.avgprice,
          tableData.bcramt,
          tableData.mprice,
          tableData.bgtamt,
          tableData.namt,
          tableData.unreal,
          tableData.ur_ratio,
          tableData.currnm,
          tableData.ioflag,
        ];
        return [...stringArr];
      },
    );

    const offsetCdtdTableData = this.offsetCdtdTableData.map(
      (tableData, index, array) => {
        const isLastRow = index === array.length - 1;
        const stringArr = [
          isLastRow ? '合計' : tableData.serialNumber,
          tableData.ttype,
          tableData.stock,
          tableData.stocknm,
          tableData.cqty,
          tableData.bprice,
          tableData.sprice,
          tableData.cramt,
          tableData.lastprice,
          tableData.gtamt,
          tableData.nowamt,
          tableData.profit,
          tableData.currnm,
        ];
        return [...stringArr];
      },
    );

    const offsetTdyTableData = this.offsetTdyTableData.map(
      (tableData, index, array) => {
        const isLastRow = index === array.length - 1;
        const stringArr = [
          isLastRow ? '合計' : tableData.serialNumber,
          tableData.ttypename,
          tableData.stock,
          tableData.stocknm,
          tableData.cqty,
          tableData.avgprice,
          tableData.cost,
          tableData.income,
          tableData.lastprice,
          tableData.gtamt,
          tableData.nowamt,
          tableData.profit,
          tableData.ur_ratio,
          tableData.currnm,
          tableData.ioflag,
        ];
        return [...stringArr];
      },
    );

    return [
      { tableHeader: rootTableHeader, tableData: [] },
      {
        tableHeader: unoffsetYestTableHeader,
        tableData: unoffsetYestExportData,
      },
      {
        tableHeader: unoffsetTdyaddTableColumns,
        tableData: unoffsetTdyaddTableData,
      },
      { tableHeader: offsetCdtdTableColumns, tableData: offsetCdtdTableData },
      { tableHeader: offsetTdyTableColumns, tableData: offsetTdyTableData },
    ];
  }

  showDialog(): void {
    this.visible = true;
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  isSortable(): void {
    const isUnoffsetYestSort = this.unoffsetYestTableData.length > 2;
    const isUnoffsetTdyaddSort = this.unoffsetTdyaddTableData.length > 2;
    const isOffsetCdtdSort = this.offsetCdtdTableData.length > 2;
    const isOffsetTdySort = this.offsetTdyTableData.length > 2;

    // 遍歷表格列定義，將每個欄位的sortable屬性設定為isSort的值
    this.unoffsetYestTableColumns.forEach(
      (column) => (column.sortable = isUnoffsetYestSort),
    );
    this.unoffsetTdyaddTableColumns.forEach(
      (column) => (column.sortable = isUnoffsetTdyaddSort),
    );
    this.offsetCdtdTableColumns.forEach(
      (column) => (column.sortable = isOffsetCdtdSort),
    );
    this.offsetTdyTableColumns.forEach(
      (column) => (column.sortable = isOffsetTdySort),
    );

    // 如果表格存在，重置表格狀態
    this.unoffsetYestTableComponent?.reset();
    this.unoffsetTdyaddTableComponent?.reset();
    this.offsetCdtdTableComponent?.reset();
    this.offsetTdyTableComponent?.reset();
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

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  get unoffsetYestFilterData(): UnoffsetYest[] {
    return this.unoffsetYestTableData.filter((item) => item.ttypename !== '');
  }
  get unoffsetYestFilterTotalData(): UnoffsetYest[] {
    return this.unoffsetYestTableData.filter((item) => item.ttypename === '');
  }

  get unoffsetTdyaddFilterData(): UnoffsetTdyadd[] {
    return this.unoffsetTdyaddTableData.filter((item) => item.ttypename !== '');
  }
  get unoffsetTdyaddFilterTotalData(): UnoffsetTdyadd[] {
    return this.unoffsetTdyaddTableData.filter((item) => item.ttypename === '');
  }

  get offsetCdtdFilterData(): OffsetCdtd[] {
    return this.offsetCdtdTableData.filter((item) => item.ttype !== '');
  }
  get offsetCdtdFilterTotalData(): OffsetCdtd[] {
    return this.offsetCdtdTableData.filter((item) => item.ttype === '');
  }

  get offsetTdyFilterData(): OffsetTdy[] {
    return this.offsetTdyTableData.filter((item) => item.ttypename !== '');
  }
  get offsetTdyFilterTotalData(): OffsetTdy[] {
    return this.offsetTdyTableData.filter((item) => item.ttypename === '');
  }

  get actionNum(): string {
    const { excludeTax, excludeExDividend } = this.formGroup.value;
    const num = (excludeTax ? 1 : 0) + (excludeExDividend ? 4 : 0);
    return num.toString();
  }
}
