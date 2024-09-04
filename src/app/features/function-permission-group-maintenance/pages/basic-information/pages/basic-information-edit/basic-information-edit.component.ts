import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { GroupDataDelete } from '../../models/group-data-delete.model';
import { GroupDataQueryRequest } from '../../models/group-data-query-request.model';
import { BasicInformationService } from '../../service/basic-information.service';

import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { DatePipe } from '@angular/common';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-basic-information-edit',
  templateUrl: './basic-information-edit.component.html',
  styleUrls: ['./basic-information-edit.component.scss'],
})
export class BasicInformationEditComponent extends BaseComponent {
  buttonList!: ButtonList;
  queryForm!: FormGroup; // 表單組對象，用於管理表單的狀態和驗證
  tableColumns: TableColumn[] = [];
  submitted = false; // 表單提交狀態標誌

  // 構造函數，用於依賴注入
  constructor(
    private basicInformationService: BasicInformationService,
    private systemDynamicDialogRef: DynamicDialogRef,
    private dynamicDialogConfig: DynamicDialogConfig,
    private datePipe: DatePipe,
  ) {
    super();
  }

  // 初始化方法，在元件初始化時呼叫
  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單組
    this.initFormData(); // 初始化表單數據
    this.initFormControlDisabled(); // 初始化表單控制項的停用狀態
    this.buttonList = this.authButtonList;
  }

  /**
   * 初始化表單組
   */
  initFormGroup(): void {
    this.queryForm = this.formBuilder.nonNullable.group({
      DBSource: [''],
      GroupId: [
        '',
        [
          Validators.maxLength(10),
          Validators.minLength(2),
          Validators.required,
        ],
      ],
      GroupName: ['', [Validators.maxLength(50), Validators.required]],
      Status: ['Y'],
      Remark: ['', [Validators.maxLength(50)]], // 說明，最大長度為50
      ModDateTime: [''],
      ModDate: [''],
      ModTime: [''],
      ModUser: [''],
    });
  }

  /**
   * 初始化表單數據
   */
  initFormData(): void {
    // TODO:ModUser之後帶登入者
    // const user = localStorage.getItem(SystemLocalStorage.USER_PROFILE);
    const data = this.dynamicDialogConfig?.data;
    if (data) {
      this.queryForm.patchValue({
        DBSource: data.DBSource,
        GroupId: data.GroupId,
        GroupName: data.GroupName,
        Status: data.Status ?? 'Y',
        Remark: data.Remark,
        ModDateTime: data.ModDateTime,
        ModUser: data.ModUser,
      });
    }
  }

  /**
   * 根據是否為編輯模式來啟用或禁用表單控件
   */
  initFormControlDisabled(): void {
    if (this.dynamicDialogConfig?.data.GroupId) {
      // 判斷是否為編輯模式（如果 VarName 存在，則為編輯模式）
      this.queryForm.get('GroupId')?.disable();
    } else {
      this.queryForm.get('GroupId')?.enable();
    }
  }

  /**
   * 表單提交處理
   */
  onSubmit(): void {
    this.submitted = true;

    // 檢查表單是否有效
    if (this.queryForm.invalid) {
      return;
    }
    const formValue = this.queryForm.value;
    // 如果 Remark 沒有輸入，給空值
    if (!formValue.Remark) {
      formValue.Remark = '';
    }
    if (this.isEdit) {
      this.updateSystemData(formValue); // 更新系統數據
    } else {
      this.createSystemData(formValue); // 新增系統數據
    }

    this.initFormControlDisabled(); // 初始化表單控制項的停用狀態
  }

  /**
   * 刪除系統數據
   */
  onDelete(): void {
    const { DBSource } = this.dynamicDialogConfig?.data;
    // 從表單控件中單獨獲取 VarName 和 Number
    const GroupId = this.queryForm.get('GroupId')?.value;

    // 構建刪除請求參數
    const deleteRequest: GroupDataDelete = {
      DBSource,
      GroupId,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.DELETE,
      OperatorId: this.userAccount
    };

    // 檢查 DBSource 和 GroupId 是否存在並發送刪除請求
    this.basicInformationService
      .deleteBasicInformationData(deleteRequest)
      .subscribe({
        next: (response) => {
          this.handleSuccess('刪除成功');
        },
      });
  }

  /**
   * 修改
   * @param params 參數
   */
  updateSystemData(params: GroupDataQueryRequest): void {
    const modTime = `${this.datePipe.transform(new Date(), 'yyyyMMdd')}`;
    const modDate = `${this.datePipe.transform(new Date(), 'HHmmss')}`;
    const groupName = this.queryForm.get('GroupName')?.value;
    const groupId = this.queryForm.get('GroupId')?.value;
    const dbSource = this.queryForm.get('DBSource')?.value;
    // TODO: ModUser之後帶登入者
    const modifiedParams = {
      ...params,
      DBSource: dbSource,
      GroupId: groupId,
      GroupName: groupName,
      ModDate: modDate,
      ModTime: modTime,
      ModUser: 'testUser2',
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.UPDATE,
      OperatorId: this.userAccount,
    };

    this.basicInformationService
      .putBasicInformationData(modifiedParams)
      .subscribe({
        next: (response) => {
          this.handleSuccess('修改成功');
        },
      });
  }

  /**
   * 創建系統數據
   * @param params 參數
   */
  createSystemData(params: GroupDataQueryRequest): void {
    
    const modTime = `${this.datePipe.transform(new Date(), 'yyyyMMdd')}`;
    const modDate = `${this.datePipe.transform(new Date(), 'HHmmss')}`;
    
    // TODO: ModUser之後帶登入者
    const modifiedParams = {
      ...params,
      DBSource: '',
      ModUser: 'testUser',
      ModTime: modTime,
      ModDate: modDate,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.CREATE,
      OperatorId: this.userAccount,
    };

    this.basicInformationService
      .postBasicInformationData(modifiedParams)
      .subscribe({
        next: (response) => {
          this.systemDynamicDialogRef.close('save');
          this.handleSuccess('新增成功');
        },
      });
  }

  /**
   * 處理操作成功
   * @param {string} message 成功訊息
   */

  handleSuccess(message: string): void {
    this.systemMessageService.success(message);
    this.systemDynamicDialogRef.close();
  }

  /**
   * 重置表單中的特定字段
   */
  onResetForm(): void {
    this.queryForm.get('GroupName')?.setValue('');
    this.queryForm.get('Remark')?.setValue('');
  }
  /**
   * 關閉對話框
   */
  onCloseDialog(): void {
    this.systemDynamicDialogRef.close();
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
    return formControl
      ? formControl.invalid && (formControl.dirty || this.submitted)
      : false;
  }
  /**
   * 判斷當前是否處於編輯模式
   * @returns {boolean} 是否編輯模式
   */
  get isEdit(): boolean {
    return !!this.dynamicDialogConfig.data['GroupId'];
  }
}
