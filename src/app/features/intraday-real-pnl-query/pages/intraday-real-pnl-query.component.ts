import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';
import { IntradayRealPnlDetailQueryRequest } from '../models/intraday-real-pnl-detail-query-resquest.model';
import { CntdProfitSum } from '../models/intraday-real-pnl-query-response.model';
import { IntradayRealPnlQueryRequest } from '../models/intraday-real-pnl-query-resquest.model';
import { IntradayRealPnlQueryService } from '../service/intraday-real-pnl-query.service';
import { ExcelTableList, SearchParam } from 'src/app/shared/models/excel.model';

@Component({
  selector: 'app-intraday-real-pnl-query',
  templateUrl: './intraday-real-pnl-query.component.html',
  styleUrls: ['./intraday-real-pnl-query.component.scss'],
})
export class IntradayRealPnlQueryComponent extends BaseComponent {
  @ViewChild('tableCntdProfitSumComponent') tableCntdProfitSumComponent!: Table;
  readonly titleName = '現股當沖已實現損益查詢'; // 頁面標題名稱
  readonly totalName = '合計'; // 頁面標題名稱
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  expendRows: any = [];
  visible: boolean = false;
  buttonList!: ButtonList;
  searchParams!: IntradayRealPnlQueryRequest;
  rootTableData: any[] = [];
  cntdProfitSumTableData: any[] = [];
  cntdProfitDetailTableData: any[] = [];

  currencyTypeOptions: Option[] = [
    { id: 'A', label: '全部', value: 'A' },
    { id: 'NTD', label: '台幣', value: 'NTD' },
    { id: 'CNY', label: '人民幣', value: 'CNY' },
  ]; // 幣別下拉選單的 Options 資料

  cntdProfitSumTableColumns: TableColumn[] = [
    {
      header: '筆數',
      field: 'no',
      numberField: true,
    },
    {
      header: '成交日',
      field: 'tdate',
      sortable: false,
      dateField: true,
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
      header: '交易別',
      field: 'ttypename',
      sortable: false,
    },
    {
      header: '成交數量',
      field: 'cqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '成交價格',
      field: 'price',
      sortable: false,
      numberField: true,
    },
    {
      header: '買進金額',
      field: 'bcost',
      sortable: false,
      numberField: true,
    },
    {
      header: '賣出金額',
      field: 'scost',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益',
      field: 'profit',
      sortable: false,
      numberField: true,
    },
    {
      header: '報酬率',
      field: 'prratio',
      sortable: false,
      numberField: true,
    },
    {
      header: '委託單號',
      field: 'dseq',
      sortable: false,
    },
    {
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  cntdProfitDetailTableColumns: TableColumn[] = [
    {
      header: '成交日',
      field: 'tdate',
      sortable: false,
      dateField: true,
    },
    {
      header: '交易別',
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
      field: 'stockname',
      sortable: false,
    },
    {
      header: '數量',
      field: 'qty',
      sortable: false,
      numberField: true,
    },
    {
      header: '沖銷數量',
      field: 'cqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '單價',
      field: 'price',
      sortable: false,
      numberField: true,
    },
    {
      header: '價金',
      field: 'amt',
      sortable: false,
      numberField: true,
    },
    {
      header: '成本',
      field: 'bcost',
      sortable: false,
      numberField: true,
    },
    {
      header: '委託書號',
      field: 'dseq',
      sortable: false,
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
      header: '幣別',
      field: 'currnm',
      sortable: false,
    },
  ];

  totalTableColumns: TableColumn[] = [
    {
      header: '成交數量',
      field: 'cqty',
      sortable: false,
      numberField: true,
    },
    {
      header: '買進金額',
      field: 'bcost',
      sortable: false,
      numberField: true,
    },
    {
      header: '賣出金額',
      field: 'scost',
      sortable: false,
      numberField: true,
    },
    {
      header: '損益',
      field: 'profit',
      sortable: false,
      numberField: true,
    },
    {
      header: '報酬率',
      field: 'prratio',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private intradayRealPnlQueryService: IntradayRealPnlQueryService,
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
    this.rootTableData = [];
    this.cntdProfitSumTableData = [];
    this.expendRows = [];

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
      comp: '551',
      Invscode: 'TWSE',
      ttype: '0',
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
    this.intradayRealPnlQueryService
      .getIntradayRealPnl(this.searchParams)
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
            Array.isArray(response.cntd_profit_sums)
          ) {
            this.cntdProfitSumTableData = response.cntd_profit_sums.map(
              (item, index) => ({
                ...item,
                uuid: index,
              }),
            );
            // console.log(this.cntdProfitSumTableData);
          } else if (typeof response === 'string') {
            this.systemMessageService.error(response);
            validResponse = false;
          }

          if (!validResponse) {
            this.rootTableData = [];
            this.cntdProfitSumTableData = [];
          }

          this.hasSearched = true;
          this.isSortable();
        },
        error: (error) => {
          this.rootTableData = [];
          this.cntdProfitSumTableData = [];
          this.expendRows = [];
          this.loadingMaskService.hide();
        },
      });
  }

  // 明細查詢，點選 table 資料觸發打API，取得子層資料
  onRowSelect(rowData: CntdProfitSum, rowIndex: number): void {
    // console.log(this.expendRows);
    if (!this.expendRows[rowData.uuid]) {
      return;
    }
    this.fetchDetailData(rowData, rowIndex);
  }
  // 組查詢參數和打API
  private fetchDetailData(rowData: CntdProfitSum, rowIndex: number): void {
    // 第一次查詢的參數
    const { ...restParams } = this.searchParams;

    const params: IntradayRealPnlDetailQueryRequest = {
      ...restParams,
      stock: rowData.stock,
      dseq: rowData.dseq,
      price: rowData.price,
      ttype: rowData.ttype,
    };

    this.intradayRealPnlQueryService
      .getIntradayRealPnlDetail(params)
      .subscribe({
        next: (response) => {
          if (
            response &&
            typeof response === 'object' &&
            Array.isArray(response.cntd_profit_details)
          ) {
            // this.cntdProfitDetailTableData = response

            const selectedRowIndex = this.FilterData.findIndex(
              (item) => item.stock === rowData.stock,
            );
            // 倘沒有找到對應的行，就會回-1
            if (selectedRowIndex !== -1) {
              this.FilterData[selectedRowIndex]['cntd_profit_detail'] =
                response.cntd_profit_details;
            }
          } else if (typeof response === 'string') {
            this.cntdProfitDetailTableData = [];
            this.systemMessageService.error(response);
          }
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.cntdProfitDetailTableData = [];
          this.loadingMaskService.hide();
        },
      });
  }

  onClear(): void {
    this.formGroup.reset(); // 重置表單
    this.rootTableData = [];
    this.cntdProfitSumTableData = [];
    this.cntdProfitDetailTableData = [];
    this.expendRows = [];
    this.hasSearched = false;
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.queryTime = '';
    this.isSortable();
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
    const { APISERVER, bhno, cseq, stock, stocknm, ctype } = this.searchParams;

    const ctypeLabel =
      this.currencyTypeOptions.find((option) => option.value === ctype)
        ?.label || '';

    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stocknm || '',
      ctypeLabel,
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

    const detailTableHeader = this.cntdProfitSumTableColumns.map(
      (column) => column.header,
    );

    const detailTabletData = this.cntdProfitSumTableData.map((tableData) => {
      const stringArr = [
        tableData.no,
        tableData.tdate,
        tableData.stock,
        tableData.stocknm,
        tableData.ttypename,
        tableData.cqty,
        tableData.price,
        tableData.bcost,
        tableData.scost,
        tableData.profit,
        tableData.prratio,
        tableData.dseq,
        tableData.currnm,
      ];
      return [...stringArr];
    });

    return [
      { tableHeader: rootTableHeader, tableData: [] },
      {
        tableHeader: detailTableHeader,
        tableData: detailTabletData,
      },
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

  isSortable(): void {
    const isCntdProfitSumSort = this.cntdProfitSumTableData.length > 2;

    this.cntdProfitSumTableColumns.forEach(
      (column) => (column.sortable = isCntdProfitSumSort),
    );

    this.tableCntdProfitSumComponent?.reset();
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

  getDetailData(data: any) {
    return Array.isArray(data) ? data : [data];
  }

  showDialog(): void {
    this.visible = true;
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

  getDetailDate(data: string) {
    return this.tranferColumnService.dateChange(data);
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  get FilterData(): any[] {
    return this.cntdProfitSumTableData.filter((item) => item.no !== '合計');
  }
  get FilterTotalData(): any[] {
    return this.cntdProfitSumTableData.filter((item) => item.no === '合計');
  }

  // Excel 檔名
  get getExportFileName(): string {
    const { bhno, cseq } = this.searchParams;
    return `${this.titleName}_${bhno}_${cseq}`;
  }
}
