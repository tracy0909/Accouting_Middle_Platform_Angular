import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { ExcelTableList, SearchParam } from 'src/app/shared/models/excel.model';
import { Option } from 'src/app/shared/models/option.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { MonthlyStmtPnlRequest } from '../models/monthly-stmt-pnl-request.model';
import { MonthlyStmtPnlResponse } from '../models/monthly-stmt-pnl-response.model';
import { MonthlyStmtPnlService } from '../services/monthly-stmt-pnl.service';

@Component({
  selector: 'app-monthly-stmt-pnl',
  templateUrl: './monthly-stmt-pnl.component.html',
  styleUrls: ['./monthly-stmt-pnl.component.scss'],
})
export class MonthlyStmtPnlComponent extends BaseComponent {
  // 頁面標題名稱
  readonly titleName = '月對帳單庫存損益備查';
  // Table
  @ViewChild('monthlyStmtPnlTable') monthlyStmtPnlTable!: Table;
  // 輸入表單的 FormGroup，在 initFormGroup() 初始化
  formGroup!: FormGroup;
  // 表格資料
  tableData: MonthlyStmtPnlResponse[] = [];
  // Table 的欄位設定
  tableColumns: TableColumn[] = [];
  // 查詢帳中API主機 下拉選單選項
  apiServerOptions: Option[] = [];
  // 分公司 下拉選單選項
  branchOptions: Option[] = [];
  // 紀錄下載查詢條件
  searchParams!: MonthlyStmtPnlRequest;
  // 資料查詢時間
  queryTime: string | null = null;
  // 是否已進行查詢
  hasSearched: boolean = false;
  // 權限
  buttonList!: ButtonList;
  // 是否開啟計算方式 dialog
  visible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
    private monthlyStmtPnlService: MonthlyStmtPnlService,
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
      bdate: ['', Validators.required],
      edate: [''],
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
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
        header: '匯出日',
        field: 'expdate',
        sortable: false,
      },
      {
        header: '對帳單年月',
        field: 'expym',
        sortable: false,
      },
      {
        header: '幣別',
        field: 'currency',
        sortable: false,
      },
      {
        header: '序號',
        field: 'datano',
        sortable: false,
        numberField: true,
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
        header: '庫存餘額',
        field: 'qty',
        sortable: false,
        numberField: true,
      },
      {
        header: '平均成本價格',
        field: 'avgprice',
        sortable: false,
        numberField: true,
      },
      {
        header: '總投資成本',
        field: 'amt',
        sortable: false,
        numberField: true,
      },
      {
        header: '參考市價',
        field: 'marketprice',
        sortable: false,
        numberField: true,
      },
      {
        header: '參考市值',
        field: 'marketvalue',
        sortable: false,
        numberField: true,
      },
      {
        header: '未實現投資損益(不含息)',
        field: 'profit',
        sortable: false,
        numberField: true,
      },
      {
        header: '未實現報酬率(不含息)',
        field: 'profitrate',
        sortable: false,
        numberField: true,
      },
      {
        header: '配息',
        field: 'divamt',
        sortable: false,
        numberField: true,
      },
      {
        header: '未實現投資損益(含息)',
        field: 'profitdiv',
        sortable: false,
        numberField: true,
      },
      {
        header: '未實現報酬率(含息)',
        field: 'profitratediv',
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
    const { bdate, edate } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: 'TWSE',
      comp: '551',
      bdate: this.datePipe.transform(bdate, 'yyyyMM') ?? '',
      edate: this.datePipe.transform(edate, 'yyyyMMdd') ?? '',
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
    this.monthlyStmtPnlService
      .getMonthlyStmtPnlData(this.searchParams)
      .subscribe({
        next: (response) => {
          // 資料查詢時間
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          if (Array.isArray(response)) {
            this.tableData = response.map((item) => ({
              ...item,
              expym: this.tranferColumnService
                .dateChange(item.expym)
                .replace(/\/$/, ''),
            }));
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
      '帳號',
      '對帳年月',
      '匯出日',
    ];
    // 查詢條件資料
    const { APISERVER, bhno, cseq, bdate, edate } = this.searchParams;
    // console.log(this.searchParams);
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      bdate || '',
      edate || '',
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
        tableData.expdate,
        tableData.expym,
        tableData.currency,
        tableData.datano,
        tableData.ttypename,
        tableData.stock,
        tableData.stockname,
        tableData.qty,
        tableData.avgprice,
        tableData.amt,
        tableData.marketprice,
        tableData.marketvalue,
        tableData.profit,
        tableData.profitrate,
        tableData.divamt,
        tableData.profitdiv,
        tableData.profitratediv,
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

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);
    if (this.monthlyStmtPnlTable) {
      this.monthlyStmtPnlTable.reset();
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
