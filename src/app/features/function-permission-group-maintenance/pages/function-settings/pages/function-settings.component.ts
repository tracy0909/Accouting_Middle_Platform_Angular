import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { Option } from 'src/app/base/models/option.model';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { FunctionGroupSettingDelete } from '../models/function-group-setting-delete.model';
import { FunctionSettingRequest } from '../models/function-settings-request.model';
import { FunctionSettingResponse } from '../models/function-settings-response.model';
import { FunctionSettingsService } from '../service/function-settings.service';
import { FunctionSettingEditComponent } from './function-setting-edit/function-setting-edit.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-function-settings',
  templateUrl: './function-settings.component.html',
  styleUrls: ['./function-settings.component.scss'],
})
export class FunctionSettingsComponent extends BaseComponent {
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  @ViewChild('tableComponent') tableComponent!: Table; // 表格組件
  queryForm!: FormGroup; // 表單組物件
  tableColumns: TableColumn[] = []; // 表格列陣列
  rowSelectedData: any = []; // 選中的行數據
  options: Option[] = []; // 動態下拉選單的 Options 資料
  tableData: FunctionSettingResponse[] = []; //表格數據
  private keepSearchParams?: FunctionSettingRequest; // 用於儲存搜尋條件的變數
  selectedRows: FunctionSettingResponse[] = []; // 選中的行數據
  hasQueryResults: boolean = false; // 查詢結果的狀態
  readonly titleName = '功能權限群組維護 - 功能清單設定'; // 頁面標題名稱

  constructor(private functionSettingsService: FunctionSettingsService) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單
    this.initTableColumns(); // 初始化表格列
    this.setOptions(); // 初始化下拉式選單
    this.hasQueryResults = false; // 確保初始狀態為 false
    this.buttonList = this.authButtonList;
    this.changePermissionStatus();
  }

  // 初始化表單
  initFormGroup(): void {
    this.queryForm = this.formBuilder.nonNullable.group({
      DBSource: ['', Validators.required],
      GroupId: [''],
      GroupName: [''],
      Status: [''],
    });
    if (this.queryForm.contains('DBSource')) {
      this.queryForm.patchValue(this.getUserInfoDefaultParams());
    }
  }

  // 初始化表格列
  editMenu: MenuItem[] = [
    {
      label: '清空群組對應使用者',
      automationId: '清空群組對應使用者',
      icon: 'pi pi-trash',
      // 點擊清空按鈕可以去呼叫 clearFunctionGroupSetting 方法
      command: () => {
        this.clearFunctionGroupSetting();
      },
      disabled: true, // 初始設置為禁用
    },
  ];

  // 初始化表單表頭
  initTableColumns(): void {
    this.tableColumns = [
      {
        header: '群組代碼',
        field: 'GroupId',
        sortable: true,
      },
      {
        header: '群組名稱',
        field: 'GroupName',
        sortable: true,
      },
      {
        header: '狀態',
        field: 'Status',
        sortable: true,
      },
      {
        header: '描述',
        field: 'Remark',
        sortable: true,
      },
      {
        header: '更新日期',
        field: 'ModDateTime',
        sortable: true,
      },
      {
        header: '更新人員',
        field: 'ModUser',
        sortable: true,
      },
    ];
  }

  changePermissionStatus(): void {
    this.editMenu[0].visible = this.buttonList.delete;
  }

  // 查詢方法
  doQuery(isRequery: boolean = false): void {
    this.loadingMaskService.show();
    this.hasQueryResults = false;
    if (this.queryForm.invalid) {
      this.loadingMaskService.hide();
      return;
    }
    this.tableData = [];
    const params = isRequery
      ? this.keepSearchParams
      : {
          ...this.queryForm.getRawValue(),
          MenuId: this.menuId,
          ButtonType: AuthButtonEnum.QUERY,
          OperatorId: this.userAccount,
        };
    this.setDefaultParams(params);

    // console.log(params);
    this.functionSettingsService.getFunctionSettingData(params).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (response && response.length > 0) {
          this.keepSearchParams = params;
          this.tableData = response.map((item, index) => {
            const { ModDate, ModTime, Status } = item;
            const dateString = this.tranferColumnService.dateChange(ModDate);
            const timeString = this.tranferColumnService.timeChange(ModTime);
            let statusString = '';

            switch (Status) {
              case '':
                statusString = '全部';
                break;
              case 'Y':
                statusString = '啟用';
                break;
              case 'N':
                statusString = '停用';
                break;
              default:
                statusString = Status;
            }
            return {
              ...item,
              ModDateTime: `${dateString} ${timeString}`,
              serialNumber: index + 1,
              Status: statusString,
            };
          });
          this.hasQueryResults = true;
        } else {
          this.tableData = [];
          this.hasQueryResults = false;
        }
        this.clearRowSelectedData();
        this.isSortable();
      },
      error: (error) => {
        this.tableData = [];
      },
      complete: () => {
        this.loadingMaskService.hide();
        this.hasQueryResults = false;
        this.clearRowSelectedData();
        this.isSortable();
      },
    });
  }

  // 檢查是否顯示 p-menubar
  get shouldShowMenubar(): boolean {
    return !!this.keepSearchParams;
  }

  // 清除表單並重置
  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
    this.queryForm.patchValue(this.getUserInfoDefaultParams());
    this.tableComponent.reset(); // 重置分頁到第一頁
    this.tableData = []; // 清空查詢資料
    this.clearRowSelectedData(); // 清除選中行資料
    this.keepSearchParams = undefined;
    this.hasQueryResults = false; // 重置查詢結果狀態
    this.isSortable(); // 重置排序狀態
    this.queryTime = ''; // 清空查詢時間
  }

  // 清空選中行資料
  clearRowSelectedData(): void {
    this.rowSelectedData = [];
    this.setBtnDeleteDisable(); // 設定刪除按鈕是否可用
  }

  /**
   * 設置 清空按鈕是否 disable
   */
  setBtnDeleteDisable(): void {
    const btnDelete = this.editMenu.find(
      (menuItem) => menuItem.automationId === '清空群組對應使用者',
    );
    if (btnDelete) {
      btnDelete.disabled =
        !this.rowSelectedData || this.rowSelectedData.length <= 0;
    }
    this.redrawDetailMenu(); // 重新繪製詳細菜單
  }

  /**
   * 重新繪製詳細菜單
   */
  redrawDetailMenu(): void {
    this.editMenu = [...this.editMenu];
  }

  handleSuccess(message: string): void {
    this.systemMessageService.info(message);
  }

  // 設定資料庫別下拉選單
  setOptions(): void {
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (options) => {
        this.options = options;
      },
    });
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.tableComponent) {
      this.tableComponent.reset();
    }
  }

  onHeaderCheckboxToggle(event: { checked: boolean }): void {
    this.updateEditMenu();
  }

  updateEditMenu() {
    // 更新編輯菜單的狀態，例如啟用/禁用某些按鈕
    this.editMenu[0].disabled = this.selectedRows.length === 0;
    this.editMenu = [...this.editMenu]; // 觸發變更檢測
  }

  // 打開編輯設定對話框
  doOpenUpdateDialog(rowData?: FunctionSettingResponse): void {
    if (rowData && !this.buttonList.update) {
      return;
    }
    const headerTitle = '功能權限群組維護';
    // console.log('Opening dialog with rowData:', rowData);

    const rowDataToSend = rowData ? { ...rowData } : {};
    // 確保 DBSource 被正確傳遞然後可以帶預設的參數
    // this.queryForm.get('DBSource')?.value || this.keepSearchParams;

    // console.log('Data being sent to dialog:', rowDataToSend);
    const ref = this.dialogService.open(FunctionSettingEditComponent, {
      header: headerTitle,
      data: rowDataToSend,
      width: '800px',
      closable: false,
    });
    ref.onClose.subscribe((result) => {
      if (result) {
        // 如果返回了數據，更新父組件的數據
        this.updateFunctionSettings(result);
      }
    });
  }

  // 添加新方法來處理從對話框返回的數據
  private updateFunctionSettings(updatedData: FunctionSettingResponse): void {
    // 在 tableData 陣列中查找與更新資料匹配的項目索引
    const index = this.tableData.findIndex(
      (item) => item.GroupId === updatedData.GroupId,
    );
    // 如果有找到匹配的項目
    if (index !== -1) {
      // 更新tableData中的對應項,保留原有屬性並覆蓋更新的屬性
      this.tableData[index] = { ...this.tableData[index], ...updatedData };
      // 如果更新的行在當前選中的行中，也更新選中的行數據
      const selectedIndex = this.selectedRows.findIndex(
        (item) => item.GroupId === updatedData.GroupId,
      );

      // 如果在選中的行中找到匹配項
      if (selectedIndex !== -1) {
        // 更新selectedRows中的對應項,保留原有屬性並覆蓋更新的屬性
        this.selectedRows[selectedIndex] = {
          ...this.selectedRows[selectedIndex],
          ...updatedData,
        };
      }
    }
  }

  // 清空功能群組設定
  clearFunctionGroupSetting(): void {
    if (this.selectedRows.length === 0) {
      this.systemMessageService.error('請先選擇要清空的群組');
      return;
    }

    this.systemConfirmationService.confirmClearanceSelected(() => {
      const DBSource = this.queryForm.get('DBSource')?.value;

      this.loadingMaskService.show();

      // 使用 forkJoin 处理多个请求
      const clearRequests = this.selectedRows.map((row) =>
        this.functionSettingsService.clearFunctionGroupSetting({
          DBSource: DBSource,
          GroupId: row.GroupId,
          MenuId: this.menuId,
          ButtonType: AuthButtonEnum.DELETE,
          OperatorId: this.userAccount,
        }),
      );

      forkJoin(clearRequests).subscribe({
        next: (responses) => {
          // console.log('清空功能群組設定響應:', responses);
          this.systemMessageService.success('選中的功能群組設定已成功清空');
          this.doQuery(true); // 重新查詢數據
          this.selectedRows = []; // 清空選擇
          this.loadingMaskService.hide();
        },
      });
    }, this.selectedRows.length);
  }

  // 清空
  clearData(): void {
    this.loadingMaskService.show();
    // 構造刪除請求的參數

    const list = this.rowSelectedData
      .map((item: FunctionGroupSettingDelete) => item.GroupId)
      .join(',');
    const param = {
      // TODO DBSource
      DBSource: this.rowSelectedData[0].DBSource,
      GroupId: list,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.DELETE,
      OperatorId: this.userAccount,
    };

    // 檢查 params 是否存在且不為空
    if (this.rowSelectedData.length > 0) {
      this.functionSettingsService.clearFunctionGroupSetting(param).subscribe({
        next: (response) => {
          this.loadingMaskService.hide();
          this.handleSuccess('清空成功');
          this.doQuery(true);
        },
      });
    }
  }
  // 獲取表單資料
  formControl(formControlName: string): FormControl {
    return this.queryForm.get(formControlName) as FormControl;
  }

  // 檢查表單控制項是否無效
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.queryForm.get(formControlName);
    return formControl ? formControl.invalid && formControl.dirty : false;
  }

  onSelect() {
    this.editMenu[0].disabled = this.selectedRows.length === 0;
    this.editMenu = [...this.editMenu];
  }
}
