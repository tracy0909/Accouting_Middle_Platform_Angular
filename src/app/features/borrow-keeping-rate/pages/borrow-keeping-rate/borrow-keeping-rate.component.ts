import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { Option } from 'src/app/shared/models/option.model';
import { BorrowKeepingRateService } from '../../services/borrow-keeping-rate.service';
import { ExcelTableList } from 'src/app/shared/models/excel.model';
import { KeepingRate } from '../../models/keeping-rate.model';
import {
  SearchParamExcel,
  SearchParams,
} from '../../models/search-param.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
@Component({
  selector: 'app-borrow-keeping-rate',
  templateUrl: './borrow-keeping-rate.component.html',
  styleUrls: ['./borrow-keeping-rate.component.scss'],
})
export class BorrowKeepingRateComponent extends BaseComponent {
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '借券維持率查詢'; // 頁面標題名稱
  keepingRates: KeepingRate[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  /** 紀錄下載查詢條件 */
  searchParams!: SearchParams;
  tableColumns: TableColumn[] = [
    {
      header: '借券額度',
      field: 'brcredit',
      sortable: false,
      numberField: true,
    },
    {
      header: '借券已用額度',
      field: 'usebramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '借券可用額度',
      field: 'unusebramt',
      sortable: false,
      numberField: true,
    },
    {
      header: '借券維持率',
      field: 'accmrate_br',
      sortable: false,
      numberField: true,
    },
  ];

  constructor(
    private borrowKeepingRateService: BorrowKeepingRateService,
    private excelExportService: ExcelExportService,
    private addUserLogsService: AddUserLogsService,
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
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
  }

  onSearch(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.keepingRates = [];
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      sid: 'ad',
      sip: this.getUserIP,
      Invscode: '',
      comp: '551',
      urls: true,
      httpsUrls: true,
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
    this.borrowKeepingRateService.getKeepRate(this.searchParams).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (Array.isArray(response)) {
          this.keepingRates = response;
          this.hasSearched = true; // 設置為已查詢
        } else {
          this.systemMessageService.error(response);
        }
        this.loadingMaskService.hide();
      },
      error: (error) => {
        this.keepingRates = [];
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
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.keepingRates = []; // 清除 table
    this.hasSearched = false;
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
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
      `${this.titleName}`,
      true,
    );
  }

  private getDatabase(value: string): string {
    const database = this.options.find((opt) => opt.value === value);
    return database ? database.label : value;
  }

  private getBranchLabel(value: string): string {
    const branch = this.branchOptions.find((opt) => opt.value === value);
    return branch ? branch.label : value;
  }

  private getSearchParams(): SearchParamExcel {
    // 查詢條件
    const paramHeadr = ['查詢帳中API主機', '分公司', '客戶帳號'];
    // 查詢條件資料
    const { APISERVER, bhno, cseq } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    // 準備table header 資料
    const tableHeader = this.tableColumns.map((column) => column.header);
    // 下載表格會需要把所有資料變[] 下載資料變[]好幾筆
    const exportData = this.keepingRates.map((keepingRate) => {
      const stringArr = [
        keepingRate.brcredit,
        keepingRate.usebramt,
        keepingRate.unusebramt,
        keepingRate.accmrate_br,
      ];
      return [...stringArr];
    });
    return [{ tableHeader, tableData: exportData }];
  }
}
