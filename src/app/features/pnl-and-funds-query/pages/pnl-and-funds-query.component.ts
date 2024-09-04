import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { PnlAndFundsQueryService } from '../service/pnl-and-funds-query.service';
import { ExcelTableList, SearchParam } from 'src/app/shared/models/excel.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { PnlAndFundsQueryResponse } from '../models/pnl-and-funds-query-response.model';
import { PnlAndFundsQueryRequest } from '../models/pnl-and-funds-query-resquest.model';

@Component({
  selector: 'app-pnl-and-funds-query',
  templateUrl: './pnl-and-funds-query.component.html',
  styleUrls: ['./pnl-and-funds-query.component.scss'],
})
export class PnlAndFundsQueryComponent extends BaseComponent {
  readonly titleName = '總損益及資金查詢'; // 頁面標題名稱
  formGroup!: FormGroup;
  visible: boolean = false;
  buttonList!: ButtonList;
  queryTime: string | null = null; // 資料查詢時間
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  searchParams!: PnlAndFundsQueryRequest;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  tableData: PnlAndFundsQueryResponse[] = [];

  constructor(
    private excelExportService: ExcelExportService,
    private pnlAndFundsQueryService: PnlAndFundsQueryService,
    private addUserLogsService: AddUserLogsService,
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
      action: [false],
    });
    if (this.formGroup.contains('APISERVER')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
  }

  onSearch(): void {
    this.tableData = [];

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const formValues = this.formGroup.getRawValue();
    this.searchParams = {
      ...formValues,
      sid: 'ad',
      sip: this.getUserIP,
      action: formValues.action ? '1' : '0',
      comp: '551',
      Invscode: 'TWSE',
    };
    this.setDefaultParams(this.searchParams);
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify(this.searchParams),
    };
    this.addUserLogsService.addUserLog(log);
    // console.log(this.searchParams);
    this.loadingMaskService.show();
    this.pnlAndFundsQueryService.getPnlAndFunds(this.searchParams).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (response) {
          this.tableData = response['profit_sum'].filter(
            (data: any) => data['Currnm'][0] !== 'USD',
          );
          // console.log(this.tableData);
          this.hasSearched = true; // 設置為已查詢
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

  /**
   * 清除表單並重置
   */
  onClearForm(): void {
    this.formGroup.reset(); // 清空表單
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: this.branchOptions[0].value });
    }
    this.hasSearched = false; // 重置搜尋狀態
    // 清空表格數據
    this.tableData = [];
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
    const paramHeadr = ['查詢帳中API主機', '分公司', '客戶帳號', '不含稅費'];
    // 查詢條件資料
    const { APISERVER, bhno, cseq, action } = this.searchParams;
    const paramData = [
      this.getDatabase(APISERVER), // 轉換分公司
      this.getBranchLabel(bhno), // 轉換分公司
      cseq || '',
      action ? '✔' : '✘',
    ];
    return { paramHeadr, paramData };
  }

  private getExcelTableList(): ExcelTableList[] {
    const createExcelTable = (currency: string, data: any) => {
      return [
        { tableHeader: [currency], tableData: [] },
        {
          tableHeader: ['今日總損益', '= 未實現損益', '+ 已實現損益'],
          tableData: [
            [
              data.total_profit_tdy || '',
              data.unreal_tdy || '',
              data.profit_tdy || '',
            ],
          ],
        },
        {
          tableHeader: ['累計總損益', '= 未實現損益', '+ 已實現損益(累計)'],
          tableData: [
            [
              data.total_profit_amass || '',
              data.unreal_amass || '',
              data.profit_amass || '',
            ],
          ],
        },
        {
          tableHeader: ['可使用資金', '= 自訂資金', '+ 歷史應收付'],
          tableData: [
            [data.avacapital || '', data.capital || '', data.hiscapital || ''],
          ],
        },
        {
          tableHeader: ['', '', '', '+ T日應收付款'],
          tableData: [['', '', '', data.tnetamt || '']],
        },
        {
          tableHeader: ['', '', '', '+ T+1日應收付款'],
          tableData: [['', '', '', data.t1netamt || '']],
        },
        {
          tableHeader: ['', '', '', '+ T+2日應收付款'],
          tableData: [['', '', '', data.t2netamt || '']],
        },
      ];
    };

    const twData = this.tableData[0] || {};
    const cnyData = this.tableData[1] || {};

    return [
      ...createExcelTable('台幣', twData),
      ...createExcelTable('人民幣', cnyData),
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

  showDialog(): void {
    this.visible = true;
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
  // 表單的值若為空值，顯示紅框警告
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || formControl.touched)
      : false;
  }
}
