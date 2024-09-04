import { DatePipe } from '@angular/common';
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
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { LoginHistQueryRequest } from '../models/login-hist-query-request.model';
import { LoginHistQueryResponse } from '../models/login-hist-query-response.model';
import { LoginHistQueryService } from '../service/login-hist-query.service';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-login-hist-query',
  templateUrl: './login-hist-query.component.html',
  styleUrls: ['./login-hist-query.component.scss'],
})
export class LoginHistQueryComponent extends BaseComponent {
  @ViewChild('tableComponent') tableComponent!: Table; // 表格對象，用於訪問表格實例
  queryForm!: FormGroup; // 表單組對象 !: FormGroup; // 表單組對象
  options: Option[] = []; // 動態下拉選單的 Options 資料
  tableData: LoginHistQueryResponse[] = [];
  tableColumns: TableColumn[] = []; // 表格列數組
  queryTime: string | null = null; // 資料查詢時間
  searchParams!: LoginHistQueryRequest;
  buttonList!: ButtonList;
  readonly titleName = '使用者登入記錄查詢';

  constructor(
    private datePipe: DatePipe,
    private loginHistQueryService: LoginHistQueryService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單組
    this.initTableColumns(); // 初始化表格列
    this.setOptions(); // 初始化下拉式選單
    this.setFormValue();
    this.buttonList = this.authButtonList;
  }

  /**
   * 初始化表單
   */
  initFormGroup(): void {
    this.queryForm = this.formBuilder.nonNullable.group({
      DBSource: ['', Validators.required],
      LoginId: [''],
      DateStart: ['', [Validators.required, this.dateRangeValidator()]],
      DateEnd: ['', [Validators.required, this.dateRangeValidator()]],
      StatusCode: [''],
    });
    if (this.queryForm.contains('DBSource')) {
      this.queryForm.patchValue(this.getUserInfoDefaultParams());
    }
  }

  /**
   * 初始化表格列
   */
  initTableColumns(): void {
    this.tableColumns = [
      {
        header: '使用者登入代碼',
        field: 'LoginId',
        sortable: false,
      },
      {
        header: '登入日期',
        field: 'LoginDate',
        sortable: false,
      },
      {
        header: '登入時間',
        field: 'LoginTime',
        sortable: false,
      },
      {
        header: 'IP',
        field: 'IP',
        sortable: false,
      },
      {
        header: '登入狀態',
        field: 'StatusCode',
        sortable: false,
      },
      {
        header: '登入訊息',
        field: 'StatusMsg',
        sortable: false,
      },
    ];
  }

  doQuery(): void {
    // 檢查表單是否有效
    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      // console.log('invalid');
      return;
    }
    this.loadingMaskService.show();
    this.tableData = [];
    const { DateStart, DateEnd } = this.queryForm.value;
    this.searchParams = {
      ...this.queryForm.getRawValue(),
      DateStart: this.datePipe.transform(DateStart, 'yyyyMMdd') ?? '',
      DateEnd: this.datePipe.transform(DateEnd, 'yyyyMMdd') ?? '',
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.setDefaultParams(this.searchParams);

    // console.log(this.searchParams);
    this.loginHistQueryService
      .getLoginHistQueryData(this.searchParams)
      .subscribe({
        next: (response) => {
          this.loadingMaskService.hide();
          if (response) {
            this.queryTime = new Date().toLocaleTimeString('zh-TW', {
              hour12: false,
            });
            this.tableData = response.map((item) => {
              const { LoginDate, LoginTime, StatusCode } = item;
              const dateString =
                this.tranferColumnService.dateChange(LoginDate);
              const timeString =
                this.tranferColumnService.timeChange(LoginTime);
              let statusString = '';
              switch (StatusCode) {
                case '0':
                  statusString = StatusCodeEnum.SUCCESS;
                  break;
                case '1':
                  statusString = StatusCodeEnum.FAIL;
                  break;
                default:
                  statusString = StatusCode;
              }
              return {
                ...item,
                StatusCode: statusString,
                LoginDate: `${dateString}`,
                LoginTime: `${timeString}`,
              };
            });
            this.isSortable();
          }
        },
        error: (error) => {
          this.tableData = [];
          // console.log('this.tableData:', this.tableData);
        },
      });
  }

  // 清除表單並重置
  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
    this.tableData = []; // 清空查詢資料
    this.setFormValue();
    this.queryForm.patchValue(this.getUserInfoDefaultParams());
    this.isSortable();
    this.queryTime = '';
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    if (this.tableComponent) {
      this.tableComponent.reset();
    }
  }

  private setFormValue(): void {
    const today = new Date();
    this.queryForm.get('DateEnd')?.setValue(today);
    this.queryForm.get('DateStart')?.setValue(today);
  }

  // 提示錯誤訊息
  showErrorMessage(name: string): string {
    let formControl = this.queryForm.get(name);
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

  /**
   * 設置動態下拉選單的 Options 資料
   */
  setOptions(): void {
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (options) => {
        this.options = options;
      },
    });
  }

  /**
   * 獲取表單控件
   * @param {string} formControlName 表單控件名稱
   * @returns {FormControl} 表單控件
   */
  formControl(formControlName: string): FormControl {
    return this.queryForm.get(formControlName) as FormControl;
  }

  /**
   * 檢查表單控件是否無效
   * @param {string} formControlName 表單控件名稱
   * @returns {boolean} 表單控件是否無效
   */
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.queryForm.get(formControlName);
    return formControl ? formControl.invalid && formControl.dirty : false;
  }

  // 三個月區間判斷
  dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }
      const startFormControl = control.parent.get('DateStart');
      const endFormControl = control.parent.get('DateEnd');

      const start = new Date(startFormControl?.value);
      const end = new Date(endFormControl?.value);
      const maxRange = 3 * 30 * 24 * 60 * 60 * 1000; // 3 months in milliseconds

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

  get isDateInvalid(): boolean {
    if (this.formControl('DateStart') && this.formControl('DateEnd')) {
      this.formControl('DateStart').markAsDirty();
      this.formControl('DateEnd').markAsDirty();
    }
    return (
      this.formControlInvalid('DateStart') || this.formControlInvalid('DateEnd')
    );
  }
}

enum StatusCodeEnum {
  SUCCESS = '成功',
  FAIL = '失敗',
}
