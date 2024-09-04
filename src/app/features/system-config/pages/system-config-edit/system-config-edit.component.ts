import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SystemConfigService } from '../../services/system-config.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DeleteSystemConfigRequest } from '../../models/delete-system-config-request.model';
import { AddOrUpdateSystemConfigRequest } from '../../models/add-or-update-system-config-request.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-system-config-edit',
  templateUrl: './system-config-edit.component.html',
  styleUrls: ['./system-config-edit.component.scss'],
})
export class SystemConfigEditComponent extends BaseComponent {
  systemForm!: FormGroup; // 表單組對象，用於管理表單的狀態和驗證
  submitted = false; // 表單提交狀態標誌
  buttonList!: ButtonList;

  // 構造函數，用於依賴注入
  constructor(
    private systemConfigService: SystemConfigService,
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
    this.systemForm = this.formBuilder.nonNullable.group({
      DBSource: [''],
      VarName: ['', [Validators.maxLength(20), Validators.required]], // 系統變數名稱，最大長度為20
      Number: ['', [Validators.maxLength(4), Validators.required]], // 序號，最大長度為4
      Value: ['', [Validators.maxLength(20), Validators.required]], // 設定值，最大長度為20
      VarDesc: ['', [Validators.maxLength(50), Validators.required]], // 說明，最大長度為50
      ModDateTime: [''],
      ModDate: [''],
      ModTime: [''],
      ModUser: [''],
    });
  }

  /**
   * 根據是否為編輯模式來啟用或禁用表單控件
   */
  initFormControlDisabled(): void {
    if (this.dynamicDialogConfig?.data.VarName) {
      // 判斷是否為編輯模式（如果 VarName 存在，則為編輯模式）
      this.systemForm.get('VarName')?.disable(); // 禁用 VarName 控件
      this.systemForm.get('Number')?.disable(); // 禁用 Number 控件
    } else {
      this.systemForm.get('VarName')?.enable(); // 啟用 VarName 控件
      this.systemForm.get('Number')?.enable(); // 啟用 Number 控件
    }
  }

  /**
   * 初始化表單數據
   */
  initFormData(): void {
    // const user = localStorage.getItem(SystemLocalStorage.USER_PROFILE);
    // console.log(user);
    const data = this.dynamicDialogConfig?.data;
    // console.log(data);
    if (data) {
      this.systemForm.patchValue({
        DBSource: data.DBSource,
        VarName: data.VarName,
        Number: data.Number,
        Value: data.Value,
        VarDesc: data.VarDesc,
        ModDateTime: data.ModDateTime,
        ModUser: data.ModUser,
      });
    }
  }

  /**
   * 表單提交處理
   */
  onSubmit(): void {
    this.submitted = true;

    // 檢查表單是否有效
    if (this.systemForm.invalid) {
      return;
    }
    const formValue = this.systemForm.value;

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
    // 從表單控件中單獨獲取 VarName 和 Number
    const DBSource = this.systemForm.get('VarName')?.value;
    const VarName = this.systemForm.get('VarName')?.value;
    const numberValue = this.systemForm.get('Number')?.value;

    // 構建刪除請求參數
    const deleteRequest: DeleteSystemConfigRequest = {
      VarName,
      Number: numberValue,
    };

    // 打印變數值

    const params = {
      DBSource,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.DELETE,
      OperatorId: this.userAccount,
      VN_List: [deleteRequest],
    };
    // console.log('刪除請求:', params); // 打印刪除請求的值

    // 發送刪除請求
    this.systemConfigService.deleteSystemData(params).subscribe({
      next: (response) => {
        this.handleSuccess('刪除成功');
      },
    });
  }

  /**
   * 創建系統數據
   * @param params 參數
   */
  createSystemData(params: AddOrUpdateSystemConfigRequest): void {
    // console.log('創建系統數據參數:', params); // 打印傳遞的參數
    const modTime = `${this.datePipe.transform(new Date(), 'yyyyMMdd')}`;
    const modDate = `${this.datePipe.transform(new Date(), 'HHmmss')}`;

    const modifiedParams = {
      ...params,
      // DBSource: '',
      ModUser: this.userAccount,
      ModTime: modTime,
      ModDate: modDate,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.CREATE,
      OperatorId: this.userAccount,
    };
    // console.log(modifiedParams);
    this.systemConfigService
      .postSystemDataManagement(modifiedParams)
      .subscribe({
        next: (response) => {
          this.handleSuccess('新增成功');
        },
      });
  }

  /**
   * 修改系統數據
   * @param params 參數
   */
  updateSystemData(params: AddOrUpdateSystemConfigRequest): void {
    const modTime = `${this.datePipe.transform(new Date(), 'yyyyMMdd')}`;
    const modDate = `${this.datePipe.transform(new Date(), 'HHmmss')}`;
    const varName = this.systemForm.get('VarName')?.value;
    const numberValue = this.systemForm.get('Number')?.value;
    const modifiedParams = {
      ...params,
      VarName: varName,
      Number: numberValue,
      ModUser: this.userAccount,
      ModTime: modTime,
      ModDate: modDate,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.UPDATE,
      OperatorId: this.userAccount,
    };

    // console.log(modifiedParams);

    this.systemConfigService.putSystemData(modifiedParams).subscribe({
      next: (response) => {
        this.handleSuccess('修改成功');
      },
    });
  }

  /**
   * 處理操作成功
   * @param {string} message 成功訊息
   */
  handleSuccess(message: string): void {
    this.systemMessageService.success(message);
    this.systemDynamicDialogRef.close(true);
  }

  /**
   * 關閉對話框
   */
  onCloseDialog(): void {
    this.systemDynamicDialogRef.close();
  }

  /**
   * 重置表單中的特定字段
   */
  onResetForm(): void {
    this.systemForm.get('Value')?.setValue('');
    this.systemForm.get('VarDesc')?.setValue('');
  }

  /**
   * 獲取表單控件
   * @param {string} formControlName 表單控件名稱
   * @returns {FormControl} 表單控件
   */
  formControl(formControlName: string): FormControl {
    return this.systemForm.get(formControlName) as FormControl;
  }

  /**
   * 檢查表單控件是否無效
   * @param {string} formControlName 表單控件名稱
   * @returns {boolean} 表單控件是否無效
   */
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.systemForm.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || this.submitted)
      : false;
  }

  /**
   * 判斷當前是否處於編輯模式
   * @returns {boolean} 是否編輯模式
   */
  get isEdit(): boolean {
    return !!this.dynamicDialogConfig.data['VarName'];
  }
}
