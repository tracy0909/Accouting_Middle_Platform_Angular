import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Table } from 'primeng/table';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { UnrealPnlQueryService } from '../services/unreal-pnl-query.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { concatMap } from 'rxjs';
import {
  UnrealPnlQueryResponse,
  UnrealSums,
} from '../models/unreal-pnl-query-response.model';
import { UnrealPnlQueryRequest } from '../models/unreal-pnl-query-request.model';
import { UnrealPnlQueryDetailResponse } from '../models/unreal-pnl-query-detail-response.model';
import { CostAdjustmentComponent } from 'src/app/shared/components/cost-adjustment/pages/cost-adjustment.component';
import { ExchangeRateOption } from '../../unreal-pnl-total-query/models/exchange-rate-option.model';
import { ExcelTableList, SearchParam } from 'src/app/shared/models/excel.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { UnrealPnlQueryDetailRequest } from '../models/unreal-pnl-query-detail-request.model';
import { v4 as uuidv4 } from 'uuid';
import { StockSuggestionsService } from 'src/app/shared/services/stock-suggestions.service';

@Component({
  selector: 'app-unreal-pnl-query',
  templateUrl: './unreal-pnl-query.component.html',
  styleUrls: ['./unreal-pnl-query.component.scss'],
})
export class UnrealPnlQueryComponent extends BaseComponent {
  // 頁面標題名稱
  readonly titleName = '未實現損益查詢';
  // table 名稱
  readonly totaltableName = '合計';

  // Table
  @ViewChild('unrealPnlQueryTable') unrealPnlQueryTable!: Table;
  @ViewChild('unrealPnlQueryDetailTable') unrealPnlQueryDetailTable!: Table;

  // 輸入表單的 FormGroup，在 initFormGroup() 初始化
  formGroup!: FormGroup;
  // 表格資料
  tableData: UnrealSums[] = [];
  // 明細表格資料
  detailtableData: UnrealPnlQueryDetailResponse[] = [];
  // Table 的欄位設定
  tableColumns: TableColumn[] = [];
  // 明細Table 的欄位設定
  detailtableColumns: TableColumn[] = [];
  // 合計資料的欄位設定
  totalTableColumns: TableColumn[] = [];
  // 查詢帳中API主機 下拉選單選項
  apiServerOptions: Option[] = [];
  // 分公司 下拉選單選項
  branchOptions: Option[] = [];
  // 日結狀態
  settleStatus?: string;
  // 幣別 下拉選單選項
  currencOptions: Option[] = [];
  // 庫存類別 下拉選單選項
  ttypeOptions: Option[] = [
    { id: 'A', label: '全部', value: 'A' },
    { id: '0', label: '現股', value: '0' },
    { id: '1', label: '融資', value: '1' },
    { id: '2', label: '融券', value: '2' },
    { id: 'R', label: '興櫃', value: 'R' },
  ];
  // 參考匯率 下拉選單選項
  exchangeRateOptions: ExchangeRateOption[] = [];
  // 紀錄下載查詢條件
  searchParams!: UnrealPnlQueryRequest;
  // 資料查詢時間
  queryTime: string | null = null;
  // 是否已進行查詢
  hasSearched: boolean = false;
  // 權限
  buttonList!: ButtonList;
  // 是否開啟計算方式 dialog
  visible: boolean = false;
  // 行的索引
  selectedRowIndex: number | null = null;
  // 控制資料展開
  expendRows: any = [];
  rootTableData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private unrealPnlQueryService: UnrealPnlQueryService,
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
      ctype: ['', Validators.required],
      ttype: ['A', Validators.required],
      exchangeRate: [''],
      action1: [false],
      action2: [false],
      action4: [false],
      action8: [false],
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
        header: '昨日餘額',
        field: 'qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '買成/匯入',
        field: 'bqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '賣成/匯出',
        field: 'sqty',
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
        header: '損益兩平試算',
        field: 'breakeven',
        sortable: false,
        numberField: true,
      },
      {
        header: '現先賣損益兩平試算',
        field: 'breakevenfs',
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
        header: '現價',
        field: 'lastprice',
        sortable: false,
        numberField: true,
      },
      {
        header: '漲跌',
        field: 'AD',
        sortable: false,
        numberField: true,
      },
      {
        header: '漲跌幅',
        field: 'ADR',
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
        header: '持股比率',
        field: 'holdingpercent',
        sortable: false,
        numberField: true,
      },
      {
        header: '獲利率',
        field: 'urratio',
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
        header: '利息',
        field: 'interest',
        sortable: false,
        numberField: true,
      },
      {
        header: '擔保品',
        field: 'bdnamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '保證金',
        field: 'bgtamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '幣別',
        field: 'currnm',
        sortable: false,
      },
    ];
    this.detailtableColumns = [
      {
        header: '成交日',
        field: 'tdate',
        sortable: false,
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
        header: '單價',
        field: 'price',
        sortable: false,
        numberField: true,
      },
      {
        header: '價金',
        field: 'mamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '原幣付出成本',
        field: 'cost',
        sortable: false,
        numberField: true,
      },
      {
        header: '原幣現值',
        field: 'nowamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '原幣損益試算',
        field: 'unreal',
        sortable: false,
        numberField: true,
      },
      {
        header: '損益兩平試算',
        field: 'breakeven',
        sortable: false,
        numberField: true,
      },
      {
        header: '融資金額',
        field: 'bcramt', // TODO 確認欄位
        sortable: false,
        numberField: true,
      },
      {
        header: '維持率',
        field: 'keeprate',
        sortable: false,
        numberField: true,
      },
      {
        header: '擔保品', // TODO 確認欄位
        field: 'bdnamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '保證金', // TODO 確認欄位
        field: 'bgtamt',
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
        header: '利息',
        field: 'interest',
        sortable: false,
        numberField: true,
      },
      {
        header: '借券費',
        field: 'dbfee', // TODO 確認欄位
        sortable: false,
        numberField: true,
      },
      {
        header: '標借費',
        field: 'dlfee',
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
      {
        header: '除息金額',
        field: 'divamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '調整成本',
        field: 'reprice',
        sortable: false,
        numberField: true,
        customField: true,
      },
      {
        header: '異動別',
        field: 'wtype',
        sortable: false,
      },
      {
        header: '備註',
        field: 'ioflag',
        sortable: false,
      },
    ];
    this.totalTableColumns = [
      {
        header: '即時庫存',
        field: 'real_qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '昨日餘額',
        field: 'qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '買成/匯入',
        field: 'bqty',
        sortable: false,
        numberField: true,
      },
      {
        header: '賣成/匯出',
        field: 'sqty',
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
        header: '現值',
        field: 'nowamt',
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
        field: 'urratio',
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
        header: '利息',
        field: 'interest',
        sortable: false,
        numberField: true,
      },
      {
        header: '擔保品',
        field: 'bdnamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '保證金',
        field: 'bgtamt',
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
    this.resetTableData();

    // 組查詢條件參數
    const { stock } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      action: this.actionData,
      stock: this.stockSuggestionsService.getStockValue(stock),
      exchangeRate: this.formGroup.get('exchangeRate')?.getRawValue().rate,
    };
    this.setDefaultParams(this.searchParams);

    // 記錄 log
    this.logQuery();

    // console.log('searchParams', this.searchParams);
    this.loadingMaskService.show();
    // 改為 已查詢
    this.hasSearched = true;
    this.unrealPnlQueryService
      .getUnrealPnlQueryData(this.searchParams)
      .subscribe({
        next: (response) => {
          // 資料查詢時間
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          if (typeof response === 'string') {
            // 顯示錯誤
            this.systemMessageService.error(response);
            // 重製 Table
            this.resetTableData();
          } else if (this.handleResponse(response)) {
            this.isSortable();
          }
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.tableData = [];
          this.detailtableData = [];
          this.expendRows = [];
          this.loadingMaskService.hide();
        },
      });
  }

  // 重製 Table
  private resetTableData(): void {
    this.expendRows = [];
    this.tableData = [];
    this.detailtableData = [];
    this.selectedRowIndex = null;
    this.rootTableData = [];
  }

  //  記錄 log
  private logQuery(): void {
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify(this.searchParams),
    };
    this.addUserLogsService.addUserLog(log);
  }

  // 處理查詢
  private handleResponse(response: UnrealPnlQueryResponse): boolean {
    let validResponse = true;
    // 檢查 root 是否為 array
    if (this.isValidArray(response, 'root')) {
      this.rootTableData = response.root!;
      // console.log(this.rootTableData);
    } else {
      validResponse = false;
    }

    // 檢查 unreal_sums 是否為 array
    if (this.isValidArray(response, 'unreal_sums')) {
      this.tableData = response.unreal_sums!.map((item) => ({
        ...item,
        uuid: uuidv4(),
      }));
      // console.log('this.tableData', this.tableData);
    } else {
      validResponse = false;
    }

    return validResponse;
  }

  // 檢查 response 中的 key (root, unreal_sums)是否為 array
  private isValidArray(
    response: UnrealPnlQueryResponse,
    key: keyof UnrealPnlQueryResponse,
  ): boolean {
    return response && Array.isArray(response[key]);
  }

  // 明細查詢，點選 table 資料觸發打API，取得子層資料
  onRowSelect(rowData: UnrealSums, rowIndex: number): void {
    // console.log(this.expendRows[rowData.uuid]);
    if (!this.expendRows[rowData.uuid]) {
      return;
    }
    this.fetchDetailData(rowData, rowIndex);
  }

  // 組查詢參數和打API
  private fetchDetailData(rowData: UnrealSums, rowIndex: number): void {
    // 第一次查詢的參數
    const {
      action1,
      action2,
      action4,
      action8,
      ctype,
      stockName,
      exchangeRate,
      ...restParams
    } = this.searchParams;

    const params: UnrealPnlQueryDetailRequest = {
      ...restParams,
      stock: rowData.stock, // 加入 rowData 的股票代碼
    };
    console.log(params);
    this.unrealPnlQueryService.getUnrealPnlQueryDetailData(params).subscribe({
      next: (details) => {
        if (Array.isArray(details)) {
          this.processDetailData(details, rowData.stock);
        } else {
          this.detailtableData = [];
          this.systemMessageService.error(details);
        }
        this.loadingMaskService.hide();
      },
      error: (error) => {
        this.detailtableData = [];
        this.loadingMaskService.hide();
      },
    });
  }

  // 查詢結果和轉換顯示資料
  private processDetailData(
    details: UnrealPnlQueryDetailResponse[],
    stock: string,
  ): void {
    this.detailtableData = details.map((item) => ({
      ...item,
      wtype: this.convertAa(item.wtype), // 轉換成中文
      tdate: this.tranferColumnService.dateChange(item.tdate), // ex: 14:58:02
      uuid: uuidv4(),
      isShowBtn: this.canShowAdjustButton(item.ioflag, item.ttype) ? 'Y' : 'N',
    }));
    // 找對應的行
    const selectedRowIndex = this.FilterData.findIndex(
      (item) => item.stock === stock,
    );
    // 倘沒有找到對應的行，就會回-1
    if (selectedRowIndex !== -1) {
      this.FilterData[selectedRowIndex]['detailData'] = this.detailtableData;
    }

    this.isDetailSortable();
  }

  // onRowExpand(e: any) {
  //   console.log(e);
  //   console.log(this.expendRows);
  // }

  // 清除
  onClear(): void {
    this.formGroup.reset(); // 重置表單
    this.tableData = []; // 清除日結狀態 table
    this.detailtableData = []; // 清除明細 table
    this.expendRows = [];
    this.hasSearched = false;
    this.formGroup.patchValue({
      // 重製下拉選項
      exchangeRate: this.exchangeRateOptions[0],
      ctype: this.currencOptions[0].value,
      ttype: this.ttypeOptions[0].value,
    });
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.queryTime = '';
    this.isSortable();
  }

  // 調整成本 button 顯示的條件
  canShowAdjustButton(ioflag: string, ttype: string): boolean {
    // 是否可以調整
    if (ioflag === '出借') {
      return false;
    }
    // 開放現股所有類別調整成本
    if (ttype === '0') {
      return true;
    } else {
      return false;
    }
  }

  // dialog
  doOpenUpdateDialog(rowData?: UnrealPnlQueryDetailResponse) {
    if (!rowData) {
      return;
    }
    // console.log('rowData', rowData);
    const { seqno, tdate, unreal } = rowData;
    const { APISERVER, sid, sip, Invscode, comp, bhno, cseq } =
      this.searchParams;
    const rowDataToSend = {
      APISERVER,
      seqno,
      tdate,
      sid,
      sip,
      Invscode,
      comp,
      bhno,
      cseq,
      unreal,
    };
    // console.log('rowDataToSend', rowDataToSend);
    this.dialogService
      .open(CostAdjustmentComponent, {
        header: '調整成本',
        data: rowDataToSend,
        width: '1200px',
        closable: false,
      })
      .onClose.subscribe((isCancel) => {
        if (isCancel) {
          return;
        }
        // this.doQuery(true); // 重新查詢
      });
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
      '庫存類別',
      '幣別',
      '參考匯率',
      '濾除下市股票',
      '不含稅費',
      '不計除息金',
      '顯示損益兩平',
      '日結狀態',
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
      exchangeRate,
      action1,
      action2,
      action4,
      action8,
    } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換查詢帳中API主機
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      stock || '',
      stockName || '',
      this.getTtypeLabel(ttype), // 轉換庫存類別
      this.getCtypeLabel(ctype), // 轉換幣別
      this.getExchangeRate(exchangeRate), // 轉換參考匯率
      action1 ? '✔' : '✘', //下載Excel，若為true，則Excel有打✔圖示，反之為打✘
      action2 ? '✔' : '✘',
      action4 ? '✔' : '✘',
      action8 ? '✔' : '✘',
      (this.settleStatus = this.rootTableData[0].settle_status),
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
        tableData.ttypename,
        tableData.stock,
        tableData.stocknm,
        tableData.real_qty,
        tableData.qty,
        tableData.bqty,
        tableData.sqty,
        tableData.cost,
        tableData.avgprice,
        tableData.breakeven,
        tableData.breakevenfs,
        tableData.nowamt,
        tableData.lastprice,
        tableData.AD,
        tableData.ADR,
        tableData.unreal,
        tableData.holdingpercent,
        tableData.urratio,
        tableData.bcramt,
        tableData.interest,
        tableData.bdnamt,
        tableData.bgtamt,
        tableData.currnm,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }

  // 查詢條件的下拉選單選項
  setOptions(): void {
    // 帳中API主機
    this.optionService
      .getAPIServerOptions()
      .pipe(
        concatMap((apiServerOptions) => {
          this.apiServerOptions = apiServerOptions;
          const searchParams = {
            sid: 'ad',
            sip: this.getUserIP,
            Invscode: 'TWSE',
            comp: '551',
            APISERVER: this.apiServerOptions[0].value,
          };
          this.loadingMaskService.show();
          return this.optionService.getExchangeRate(searchParams);
        }),
      )
      .subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            // 參考匯率
            this.exchangeRateOptions = response.filter(
              (option) => option.label !== 'USD',
            );
            this.formGroup
              .get('exchangeRate')
              ?.setValue(this.exchangeRateOptions[0]);
          } else {
            this.systemMessageService.error(response);
          }
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.loadingMaskService.hide();
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

    // 幣別
    this.optionService.getCurrencyOptions().subscribe({
      next: (currencOptions) => {
        this.currencOptions = currencOptions;
        if (this.currencOptions.length > 0) {
          this.formGroup.get('ctype')?.setValue(this.currencOptions[0].value);
        }
      },
    });
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
    const database = this.apiServerOptions.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  // 分公司
  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  // 幣別
  private getCtypeLabel(value: string): string {
    const currency = this.currencOptions.find((opt) => opt.value === value);
    return currency ? currency.label : value;
  }

  // 庫存類別
  private getTtypeLabel(value: string): string {
    return this.getLabelFromOptions(this.ttypeOptions, value);
  }
  // Excel 檔名
  get getExportFileName(): string {
    const { bhno, cseq } = this.searchParams;
    return `${this.titleName}_${bhno}_${cseq}`;
  }
  // 參考匯率
  get exchangeRateControl(): FormControl {
    return this.formGroup.get('exchangeRate') as FormControl;
  }
  // 參考匯率(顯示文字)
  get redInfo(): string {
    return `:${this.exchangeRateControl?.getRawValue().rate}(匯率日期:${
      this.exchangeRateControl?.getRawValue().tdate
    })`;
  }
  private getExchangeRate(rate: string): string {
    const exchangerate = this.exchangeRateOptions.find(
      (opt) => opt.rate === rate,
    );
    return exchangerate ? exchangerate.label : rate;
  }
  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  get stockNameControl(): FormControl {
    return this.formGroup.get('stockName') as FormControl;
  }

  // 不包含合計資料
  get FilterData(): UnrealSums[] {
    return this.tableData.filter((item) => item.no !== '合計');
  }
  // 合計資料
  get FilterTotalData(): UnrealSums[] {
    return this.tableData.filter((item) => item.no === '合計');
  }

  // 交易類別 轉換顯示文字
  convertAa(value: string): string {
    switch (value) {
      case '0':
        return '交易';
      case 'A':
        return '集保匯撥';
      case 'S':
        return '系統自動產生';
      case 'U-eleader':
        return '自動產生';
      case 'I-eleader':
        return '整筆調整';
      default:
        return value;
    }
  }

  // 轉checkbox參數用，濾除下市股票為1，不含稅費為2，不計除息金為4，顯示損益兩平為8，為true則相加
  get actionData(): string {
    const action1Value = this.formGroup.get('action1')?.value ? 1 : 0;
    const action2Value = this.formGroup.get('action2')?.value ? 2 : 0;
    const action4Value = this.formGroup.get('action4')?.value ? 4 : 0;
    const action8Value = this.formGroup.get('action8')?.value ? 8 : 0;
    const sum = action1Value + action2Value + action4Value + action8Value;
    return sum === 0 ? '' : sum.toString();
  }

  // 計算方式 dialog
  showDialog(): void {
    this.visible = true;
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

    if (this.unrealPnlQueryTable) {
      this.unrealPnlQueryTable.reset();
    }
  }

  isDetailSortable(): void {
    const isSort = this.detailtableData.length > 1;
    console.log(this.detailtableData);
    this.detailtableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.unrealPnlQueryDetailTable) {
      this.unrealPnlQueryDetailTable.reset();
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
