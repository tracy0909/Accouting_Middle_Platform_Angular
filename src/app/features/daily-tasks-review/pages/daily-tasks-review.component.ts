import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { DailyTasksReviewResponse } from '../models/daily-tasks-review-response.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { DailyTasksReviewService } from '../services/daily-tasks-review.service';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';

@Component({
  selector: 'app-daily-tasks-review',
  templateUrl: './daily-tasks-review.component.html',
  styleUrls: ['./daily-tasks-review.component.scss'],
})
export class DailyTasksReviewComponent extends BaseComponent {
  // 頁面標題名稱
  readonly titleName = '日常與日結作業查詢';
  // Table
  @ViewChild('dailyTasksReviewTable') dailyTasksReviewTable!: Table;
  // 輸入表單的 FormGroup，在 initFormGroup() 初始化
  formGroup!: FormGroup;
  // 表格資料
  tableData: DailyTasksReviewResponse[] = [];
  // Table 的欄位設定
  tableColumns: TableColumn[] = [];
  // 資料庫別 下拉選單選項
  dbOption: Option[] = [];
  // 分公司 下拉選單選項
  branchOptions: Option[] = [];
  // 資料查詢時間
  queryTime: string | null = null;
  // 是否已進行查詢
  hasSearched: boolean = false;
  // 權限
  buttonList!: ButtonList;
  // 轉換日期
  formattedDate!: string;
  // 轉換時間
  formattedTime!: string;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private addUserLogsService: AddUserLogsService,
    private dailyTasksReviewService: DailyTasksReviewService,
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
      DBSource: ['', Validators.required],
      BhNo: [''],
      Sdate: ['', Validators.required],
      Edate: ['', Validators.required],
      Status: [''],
      IsCorrect: [''],
    });
    if (this.formGroup.contains('DBSource')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
  }

  // 初始化表格
  private initTableColumns(): void {
    this.tableColumns = [
      { header: '交易日期', field: 'TDate', sortable: false },
      { header: '分公司', field: 'BhNo', sortable: false },
      { header: '排程代碼', field: 'ID', sortable: false },
      { header: '排程名稱', field: 'Name', sortable: false },
      { header: '執行時間（起）', field: 'STime', sortable: false },
      { header: '執行時間（迄）', field: 'ETime', sortable: false },
      { header: '排程狀態', field: 'Status', sortable: false },
      { header: '筆數檢查', field: 'CData', sortable: false },
      { header: '訊息', field: 'Message', sortable: false },
    ];
  }

  // 預設 bdate(查詢起日)跟 edate(查詢迄日)日期
  private setFormValue(): void {
    const today = new Date();

    // edate 為今日
    const toDay = new Date(today);
    this.formGroup.get('Sdate')?.setValue(toDay);
    this.formGroup.get('Edate')?.setValue(toDay);
  }

  // 查詢
  doQuery() {
    // 分公司下拉選單，若選擇後再清除，按查詢會送出 null
    if (this.formGroup.value.BhNo === null) {
      this.formGroup.get('BhNo')?.setValue('');
    }
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.loadingMaskService.show();
    this.tableData = [];
    const { Sdate, Edate } = this.formGroup.value;
    const params = {
      ...this.formGroup.getRawValue(),
      Sdate: this.datePipe.transform(Sdate, 'yyyyMMdd') ?? '',
      Edate: this.datePipe.transform(Edate, 'yyyyMMdd') ?? '',
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.setDefaultParams(params);
    this.loadingMaskService.show();
    // console.log('params', params);
    // 改為 已查詢
    this.hasSearched = true;
    this.dailyTasksReviewService.getdailyTsksReviewData(params).subscribe({
      next: (response) => {
        // 資料查詢時間
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (response) {
          this.tableData = this.transformResponse(response);
          // console.log('tableData', this.tableData);
        } else {
          this.systemMessageService.error(response);
        }
        this.isSortable();
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
    this.formGroup.reset(); // 表單清除
    this.tableData = []; // table 重置
    this.isSortable(); // 移除排序
    this.setFormValue(); // 還原預設日期
    this.hasSearched = false; // 重置查詢狀態
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: '' });
    }
    this.queryTime = '';
  }

  // tableData 參數轉換
  private transformResponse(
    response: DailyTasksReviewResponse[],
  ): DailyTasksReviewResponse[] {
    return response.map((item, index) => {
      const { TDate, STime, ETime, CData, Status } = item;
      const transformedTDate = this.tranferColumnService.dateChange(TDate);
      const transformedSTime = this.transformDateTime(STime);
      const transformedETime = this.transformDateTime(ETime);

      return {
        ...item,
        TDate: transformedTDate,
        STime: transformedSTime,
        ETime: transformedETime,
        CData: this.getStatusMessage(CData),
        serialNumber: index + 1,
        rowClass: this.getRowClass(Status, CData),
      };
    });
  }

  // STime、ETime 格式轉換(20240805142856 -> 2024/08/05 14:28:56)
  transformDateTime(dateTimeString: string): string {
    const date = dateTimeString.substring(0, 8); // "YYYYMMDD"
    const time = dateTimeString.substring(8, 14); // "HHMMSS"
    const formattedDate = this.tranferColumnService.dateChange(date);
    const formattedTime = this.tranferColumnService.timeChange(time);
    return `${formattedDate} ${formattedTime}`;
  }

  // 變更行的顏色
  private getRowClass(Status: string, CData: string): string {
    if (Status === 'FAIL' || CData === 'N') {
      return 'fail-row';
    } else if (Status === 'DONE') {
      return 'done-row';
    }
    return '';
  }

  // 查詢條件的下拉選單選項
  setOptions(): void {
    // 資料庫別
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (dbOptions) => {
        this.dbOption = dbOptions;
      },
    });
    // 分公司
    this.optionService.branchOfficesDbSourceOptions().subscribe({
      next: (branchOptions) => {
        this.branchOptions = branchOptions;
        const { bhno, cseq } = this.getDefaultParams();
        let bhnoValue = !bhno && this.branchOptions.length > 0 ? '' : bhno;
        this.formGroup.patchValue({ bhno: bhnoValue, cseq });
      },
    });
  }

  // 分公司 label(顯示 table 用)
  getBranchDisplayName(value: string): string {
    const branch = this.branchOptions.find((option) => option.value === value);
    return branch ? branch.label : value;
  }

  // 轉CData label(顯示 table 用)
  getStatusMessage(CData: string): string {
    return CData === 'Y' ? '正常' : CData === 'N' ? '錯誤' : '';
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    if (this.dailyTasksReviewTable) {
      this.dailyTasksReviewTable.reset();
    }
  }

  // 表單的值若為空值，顯示紅框警告
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || formControl.touched)
      : false;
  }

  // 格式錯誤訊息提示
  showErrorMessage(formControlName: string): string {
    const control = this.formGroup.get(formControlName);
    if (
      control &&
      control.invalid &&
      control.touched &&
      control.errors?.['required']
    ) {
      return '此欄位必須輸入';
    }
    return '';
  }
}
