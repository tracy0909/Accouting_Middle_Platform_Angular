import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { FunctionGroupSettingEditRequest } from '../../models/function-group-setting-edit-request.model';
import { FunctionGroupSettingEditResponse } from '../../models/function-group-setting-edit-response.model';
import { FunctionSettingsService } from '../../service/function-settings.service';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-function-setting-edit',
  templateUrl: './function-setting-edit.component.html',
  styleUrls: ['./function-setting-edit.component.scss'],
})
export class FunctionSettingEditComponent extends BaseComponent {
  tableColumns: TableColumn[] = [];
  functionSettings: FormArray;
  functionSettingsData: FunctionGroupSettingEditResponse[] = [];
  dataLoaded: boolean = false;
  selectAll: boolean = false;
  groupId: string = ''; // 新增的屬性
  groupName: string = ''; // 新增的屬性
  clearFlag: boolean = false; // 新增此行，用於標記是否執行了清除操作
  buttonList!: ButtonList;

  constructor(
    private functionSettingsService: FunctionSettingsService,
    private dynamicDialogConfig: DynamicDialogConfig,
    private dynamicDialogRef: DynamicDialogRef,
  ) {
    super();
    this.functionSettings = this.formBuilder.array([]);
  }

  ngOnInit(): void {
    // 初始化表格
    this.initTableColumns();
    // 從後端載入數據
    this.loadFunctionGroupSettingEditData();

    // 初始化每個權限的設定狀態
    this.functionSettings.controls.forEach(
      (control: AbstractControl, index: number) => {
        const formGroup = control as FormGroup;
        // 更新每個表單組的權限控制狀態（啟用/禁用）
        this.updatePermissionControlsState(formGroup);
      },
    );

    // 從 dynamicDialogConfig 中獲取 GroupId 和 GroupName
    this.groupId = this.dynamicDialogConfig.data.GroupId || '';
    this.groupName = this.dynamicDialogConfig.data.GroupName || '';
    this.buttonList = this.authButtonList;
  }

  // 初始化表單表頭
  initTableColumns(): void {
    this.tableColumns = [
      {
        header: '上一階層',
        field: 'ParentId',
      },
      {
        header: '功能代號',
        field: 'ModuleId',
      },
      {
        header: '功能名稱',
        field: 'ModuleName',
      },
      {
        header: '狀態',
        field: 'Status',
      },
      {
        header: '查詢',
        field: 'I',
      },
      {
        header: '新增',
        field: 'A',
      },
      {
        header: '修改',
        field: 'U',
      },
      {
        header: '刪除',
        field: 'D',
      },
      {
        header: '下載',
        field: 'L',
      },
    ];
  }
  // 添加新方法來初始化 checkbox
  initializeCheckboxes() {
    this.functionSettings.controls.forEach((control) => {
      const formGroup = control as FormGroup;
      const buttonList = formGroup.get('ButtonList')?.value || '';
      ['I', 'A', 'U', 'D', 'L'].forEach((button) => {
        formGroup.get(button)?.setValue(buttonList.includes(button));
      });
    });
  }

  // 將後端回傳的資料渲染到彈窗內
  loadFunctionGroupSettingEditData(): void {
    const params: FunctionGroupSettingEditRequest = {
      DBSource: this.dynamicDialogConfig.data.DBSource,
      GroupId: this.dynamicDialogConfig.data.GroupId,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };

    // console.log('Request params:', params);

    if (!params.DBSource || !params.GroupId) {
      console.error('Missing required parameters:', params);
      this.systemMessageService.error('缺少必要的請求參數');
      return;
    }
    this.functionSettingsService
      .getFunctionGroupSettingEditData(params)
      .subscribe({
        next: (data: FunctionGroupSettingEditResponse[]) => {
          // console.log('Received data:', data);
          if (Array.isArray(data)) {
            this.functionSettingsData = data;
            this.functionSettings = this.formBuilder.array(
              data.map((item) => this.createFunctionSettingFormGroup(item)),
            );
            console.log('Function Settings:', this.functionSettings.value);
          } else {
            console.error('Received data is not an array:', data);
          }
          this.dataLoaded = true;
        },
        error: (error) => {
          this.systemMessageService.error('加載數據失敗');
          this.dataLoaded = false;
        },
      });
  }

  // 獲取指定索引的表單
  getFormGroup(index: number): FormGroup {
    return this.functionSettings.at(index) as FormGroup;
  }

  // 全選所有群組
  onSelectAllChange(event: any) {
    this.selectAll = event.checked;
    this.functionSettings.controls.forEach((control: AbstractControl) => {
      const formGroup = control as FormGroup;
      formGroup.get('Selected')?.setValue(this.selectAll);
      this.updatePermissionControlsState(formGroup);
    });
  }

  // 根據後端傳來的資料狀態決定勾選狀態
  createFunctionSettingFormGroup(
    item: FunctionGroupSettingEditResponse,
  ): FormGroup {
    const buttonList = item.ButtonList || '';
    return this.formBuilder.group({
      DBSource: [item.DBSource],
      ModuleId: [item.ModuleId],
      ModuleName: [item.ModuleName],
      Status: [item.Status],
      ParentId: [item.ParentId],
      OrderSeq: [item.OrderSeq],
      ButtonList: [buttonList],
      Selected: [item.Selected === 'Y'], // 初始狀態設為 false
      I: [
        item.Selected === 'Y'
          ? { value: item.I === 'Y', disabled: false }
          : { value: item.I === 'Y', disabled: true },
      ],
      A: [
        item.Selected === 'Y'
          ? { value: item.A === 'Y', disabled: false }
          : { value: item.A === 'Y', disabled: true },
      ],
      U: [
        item.Selected === 'Y'
          ? { value: item.U === 'Y', disabled: false }
          : { value: item.U === 'Y', disabled: true },
      ],
      D: [
        item.Selected === 'Y'
          ? { value: item.D === 'Y', disabled: false }
          : { value: item.D === 'Y', disabled: true },
      ],
      L: [
        item.Selected === 'Y'
          ? { value: item.L === 'Y', disabled: false }
          : { value: item.L === 'Y', disabled: true },
      ],
      ModDate: [item.ModDate],
      ModTime: [item.ModTime],
      ModUser: [item.ModUser],
    });
  }

  // 決定權限設定能不能被勾選，必須 isSelected 是 true 才能勾選
  updatePermissionControlsState(formGroup: FormGroup): void {
    const isSelected = formGroup.get('Selected')?.value;
    ['I', 'A', 'U', 'D', 'L'].forEach((control) => {
      if (this.isButtonInList(formGroup, control)) {
        if (isSelected) {
          formGroup.get(control)?.enable();
        } else {
          formGroup.get(control)?.disable();
        }
      }
    });
  }
  // 修改：正確實現 isButtonInList 方法
  isButtonInList(formGroup: FormGroup, button: string): boolean {
    const buttonList = formGroup.get('ButtonList')?.value || '';
    return buttonList.includes(button);
  }

  // 檢查按鈕是否禁用
  isButtonDisabled(formGroup: FormGroup | null, button: string): boolean {
    if (!formGroup) return true;
    const buttonList = formGroup.get('ButtonList')?.value || '';
    return buttonList === '' || !buttonList.includes(button);
  }

  // 設置權限狀態
  onSelectedChange(event: any, rowIndex: number) {
    const formGroup = this.getFormGroup(rowIndex);
    formGroup.get('Selected')?.setValue(event.checked);
    this.updatePermissionControlsState(formGroup);

    // 檢查是否所有行都被選中
    this.selectAll = this.functionSettings.controls.every(
      (control: AbstractControl) => {
        return (control as FormGroup).get('Selected')?.value === true;
      },
    );
  }

  // 儲存權限設定的方法
  saveFunctionGroupSetting() {
    const functionSettingsData = this.functionSettings.controls
      // 篩選權限設置是 true　的選項
      .filter((control: AbstractControl) => {
        const formGroup = control as FormGroup;
        return formGroup.get('Selected')?.value === true;
      })
      .map((control: AbstractControl) => {
        const formGroup = control as FormGroup;
        const buttonList = ['I', 'A', 'U', 'D', 'L']
          .filter((button) => formGroup.get(button)?.value)
          .join(',');

        return {
          ModuleId: formGroup.get('ModuleId')?.value,
          ButtonList: buttonList,
        };
      });

    const requestBody = {
      DBSource: this.dynamicDialogConfig.data.DBSource,
      GroupId: this.dynamicDialogConfig.data.GroupId,
      MB_List: functionSettingsData,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.UPDATE,
      OperatorId: this.userAccount,
    };

    // console.log('查看儲存的格式內容:', JSON.stringify(requestBody, null, 2));
    // console.log(requestBody);
    this.functionSettingsService
      .saveFunctionGroupSetting(requestBody)
      .subscribe({
        next: (response: { message: string }) => {
          console.log('Save successful. Response:', response);
          this.systemMessageService.success('保存成功');
          // 更新本地數據
          this.updateLocalData(functionSettingsData);
          this.dynamicDialogRef.close(true);
        },
        error: (error) => {
          // console.error('Save failed. Error:', error);
          this.systemMessageService.error('保存失敗');
        },
      });
  }

  // 新增方法：更新本地數據
  private updateLocalData(
    updatedData: { ModuleId: string; ButtonList: string }[],
  ): void {
    updatedData.forEach((item) => {
      const index = this.functionSettingsData.findIndex(
        (data) => data.ModuleId === item.ModuleId,
      );
      if (index !== -1) {
        this.functionSettingsData[index].ButtonList = item.ButtonList;
      }
    });
  }

  // 清空方法
  clearFunctionGroupSetting() {
    const clearData = {
      DBSource: this.dynamicDialogConfig.data.DBSource,
      GroupId: this.dynamicDialogConfig.data.GroupId,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.DELETE,
      OperatorId: this.userAccount,
    };

    // console.log('Clear request parameters:', clearData);

    this.functionSettingsService
      .clearFunctionGroupSetting(clearData)
      .subscribe({
        next: (response) => {
          // console.log('Clear successful. Response:', response);
          this.systemMessageService.success('清空成功');
          this.loadFunctionGroupSettingEditData(); // 重新加載數據
        },
        error: (error) => {
          // console.error('Clear failed. Error:', error);
          this.systemMessageService.error('清空失敗');
        },
      });
  }

  // 修改：清除所有複選框
  clearCheckboxes() {
    // 取消全選勾選框的勾選狀態
    this.selectAll = false;
    (this.functionSettings.controls as FormGroup[]).forEach(
      (formGroup: FormGroup) => {
        // 包括 'Selected' 在內的所有複選框
        ['Selected', 'I', 'A', 'U', 'D', 'L'].forEach((control) => {
          const controlInstance = formGroup.get(control);
          if (controlInstance) {
            // 將所有複選框設置為 false，無論它們的原始狀態或是否被禁用
            controlInstance.setValue(false);
            // 如果控件被禁用，我們需要啟用它以便可以更改其值
            if (controlInstance.disabled) {
              controlInstance.enable();
            }
          }
        });
        // 更新權限控件的狀態
        this.updatePermissionControlsState(formGroup);
      },
    );

    this.clearFlag = true; // 設置清除標記
  }

  // 新增：關閉對話框
  closeDialog() {
    this.dynamicDialogRef.close();
  }
}
