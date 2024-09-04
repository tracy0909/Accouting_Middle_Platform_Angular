import { Component, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Table } from 'primeng/table';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { Option } from 'src/app/shared/models/option.model';
import { UserHistQueryResponse } from '../models/user-hist-query-response.model';
import { DatePipe } from '@angular/common';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { UserHistQueryService } from '../services/user-hist-query.service';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-user-hist-query',
  templateUrl: './user-hist-query.component.html',
  styleUrls: ['./user-hist-query.component.scss'],
})
export class UserHistQueryComponent extends BaseComponent {
  // Table
  @ViewChild('usertHistQueryTable') usertHistQueryTable!: Table;
  // 輸入表單的 FormGroup，在 initFormGroup() 初始化
  formGroup!: FormGroup;
  // 資料庫別 下拉選單選項
  dbOption: Option[] = [];
  // 功能代碼 下拉選單選項
  moduleIdOption: Option[] = [];
  // 按鈕種類 下拉選單選項
  buttonTypeOption: Option[] = [];
  // 表格資料陣列
  tableData: UserHistQueryResponse[] = [];
  // Table 的欄位設定
  tableColumns: TableColumn[] = [];
  // 資料查詢時間
  queryTime: string | null = null;
  buttonList!: ButtonList;
  readonly titleName = '使用者紀錄查詢';

  constructor(
    private userHistQueryService: UserHistQueryService,
    private datePipe: DatePipe,
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
    this.formGroup = this.formBuilder.nonNullable.group({
      DBSource: ['', Validators.required],
      UserId: ['', Validators.maxLength(15)],
      ButtonTypes: [''],
      ModuleId: [''],
      DateTimeStart: ['', [Validators.required, this.dateRangeValidator()]],
      DateTimeEnd: ['', [Validators.required, this.dateRangeValidator()]],
    });
    if (this.formGroup.contains('DBSource')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
  }

  // 初始化表格
  private initTableColumns(): void {
    this.tableColumns = [
      { header: '使用時間', field: 'ModDateTime', sortable: false },
      { header: '使用者帳號', field: 'UserId', sortable: false },
      { header: '功能代碼', field: 'ModuleId', sortable: false },
      { header: '功能名稱', field: 'ModuleName', sortable: false },
      { header: '按鈕種類', field: 'ButtonType', sortable: false },
      { header: '更新人員', field: 'ModUser', sortable: false },
      { header: '備註', field: 'Remark', sortable: false },
    ];
  }

  // 預設 DateTimeStart(建立日期)跟 DateTimeEnd(結束日期)日期時間
  private setFormValue(): void {
    const today = new Date();

    // DateTimeStart 為今日的 00:00
    const startOfDay = new Date(today);
    // 時, 分, 秒, 毫秒
    startOfDay.setHours(0, 0, 0, 0);
    this.formGroup.get('DateTimeStart')?.setValue(startOfDay);

    // DateTimeEnd 為今日的 23:59
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 0, 0);
    this.formGroup.get('DateTimeEnd')?.setValue(endOfDay);
  }

  // 查詢條件的下拉選單選項
  setOptions(): void {
    // 資料庫別 下拉選單的資料
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (dbOptions) => {
        this.dbOption = dbOptions;
      },
    });
    // 功能代碼 下拉選單的資料
    this.optionService.getModuleIdOptions().subscribe({
      next: (moduleIdOptions) => {
        this.moduleIdOption = moduleIdOptions;
      },
    });
    //  按鈕種類 下拉選單的資料
    this.optionService.getButtonTypeOptions().subscribe({
      next: (buttonTypeOptions) => {
        this.buttonTypeOption = buttonTypeOptions;
      },
    });
  }

  // 查詢
  doQuery(): void {
    // 檢查日期是否有效
    if (this.isDateInvalid) {
      return;
    }
    this.loadingMaskService.show();
    this.tableData = [];
    const params = {
      ...this.formGroup.value,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.setDefaultParams(params);

    // console.log('params', params);

    // DateTimeStart 和 DateTimeEnd 的日期和時間
    // 將轉換後的 DateTimeStart 和 DateTimeEnd，分別存進 DateStart、TimeStart、DateEnd、TimeEnd
    this.setFormattedDateTime(
      params,
      'DateTimeStart',
      'DateStart',
      'TimeStart',
    );
    this.setFormattedDateTime(params, 'DateTimeEnd', 'DateEnd', 'TimeEnd');

    // 刪除 DateTimeStart 和 DateTimeEnd
    delete params.DateTimeStart;
    delete params.DateTimeEnd;

    this.loadingMaskService.show();
    this.userHistQueryService.getUserHistQueryData(params).subscribe({
      next: (response) => {
        this.loadingMaskService.hide();
        if (response) {
          this.tableData = response.map((item, index) => {
            // 轉換更新日期、更新時間
            const { ModDate, ModTime } = item;
            const dateString = this.tranferColumnService.dateChange(ModDate);
            const timeString = this.tranferColumnService.timeChange(ModTime);
            return {
              ...item,
              ModDateTime: `${dateString} ${timeString}`,
              // 筆數
              serialNumber: index + 1,
            };
          });
          this.isSortable();
          // console.log('tableData', this.tableData);

          // 資料查詢時間
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
        }
      },
      error: (error) => {
        this.tableData = [];
        this.loadingMaskService.hide();
      },
    });
  }

  onClear(): void {
    // 重製表單
    this.formGroup.reset();
    // 重製表格
    if (this.usertHistQueryTable) {
      this.formGroup.reset();
      this.formGroup.patchValue(this.getUserInfoDefaultParams());

      this.tableData = [];
      this.setFormValue();
      this.isSortable();
    }
    // 重製查詢時間
    this.queryTime = '';
    // 移除排序
    this.isSortable();
  }

  /**  轉換 DateTimeStart(建立日期)跟 DateTimeEnd(結束日期)的日期、時間
   * 倘直接回傳格式會如下：
   * "DateTimeStart": "2024-07-10T09:10:16.000Z"
   * "DateTimeEnd": "2024-07-18T09:10:18.000Z"
   * @param params formGroup 所有值
   * @param source 用來存 DateTimeStart、DateTimeEnd
   * @param date 轉換後的日期 DateStart、TimeStart
   * @param time 轉換後的時間 DateEnd、TimeEnd
   */
  private setFormattedDateTime(
    params: any,
    source: string,
    date: string,
    time: string,
  ): void {
    const dateTimeValue = params[source];
    // console.log('dateTimeValue', dateTimeValue);

    // 如果 dateTimeValue 是空值的， date 和 time 對應的值也給空值(不填就送出會是 NaNaNa)
    if (!dateTimeValue) {
      params[date] = '';
      params[time] = '';
    } else {
      const formattedDateTime = this.formatDateTime(new Date(dateTimeValue));
      params[date] = formattedDateTime.date;
      params[time] = formattedDateTime.time;
    }
  }

  // 轉換日期時間
  private formatDateTime(date: Date): { date: string; time: string } {
    const formattedDate = this.datePipe.transform(date, 'yyyyMMdd') ?? '';
    const formattedTime = this.datePipe.transform(date, 'HHmmss') ?? '';
    return { date: formattedDate, time: formattedTime };
  }

  // 三個月區間判斷
  dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }
      const startFormControl = control.parent.get('DateTimeStart');
      const endFormControl = control.parent.get('DateTimeEnd');

      const start = new Date(startFormControl?.value);
      const end = new Date(endFormControl?.value);
      const maxRange = 3 * 30 * 24 * 60 * 60 * 1000; // 3 個月

      if (end.getTime() - start.getTime() > maxRange) {
        // console.log('maxRange');
        startFormControl?.setErrors({ dateRangeInvalid: true });
        endFormControl?.setErrors({ dateRangeInvalid: true });
        return { dateRangeInvalid: true };
      } else {
        startFormControl?.setErrors(
          startFormControl?.errors?.['required'] ? { required: true } : null,
        );
        endFormControl?.setErrors(
          endFormControl?.errors?.['required'] ? { required: true } : null,
        );
      }
      return null;
    };
  }

  // 取表單的值
  formControl(formControlName: string): FormControl {
    return this.formGroup.get(formControlName) as FormControl;
  }

  // 表單的值若為空值，顯示紅框警告
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    return formControl ? formControl.invalid && formControl.dirty : false;
  }

  // 檢查 DateTimeStart、DateTimeEnd 是否無效
  get isDateInvalid(): boolean {
    if (this.formControl('DateTimeStart') && this.formControl('DateTimeEnd')) {
      this.formControl('DateTimeStart').markAsDirty();
      this.formControl('DateTimeEnd').markAsDirty();
    }
    return (
      this.formControlInvalid('DateTimeStart') ||
      this.formControlInvalid('DateTimeEnd')
    );
  }

  // 按鈕種類 ButtonType label(顯示 table 用)
  getButtonTypeDisplayName(buttonType: string): string {
    const buttonTypeOption = this.buttonTypeOption.find(
      (option) => option.value === buttonType,
    );
    return buttonTypeOption ? buttonTypeOption.label : buttonType;
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    if (this.usertHistQueryTable) {
      this.usertHistQueryTable.reset();
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
    } else if (formControl?.errors?.['dateRangeInvalid']) {
      errorMessage = `查詢區間不可超過三個月`;
    }
    return errorMessage;
  }
}
