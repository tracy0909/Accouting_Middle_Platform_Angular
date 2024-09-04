import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem, TableState } from 'primeng/api';
import { Option } from 'src/app/shared/models/option.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { UserSettingsDataQueryResponse } from '../models/user-settings-query-response.model';
import { Table } from 'primeng/table';
import { TabMenu } from 'primeng/tabmenu';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { MgrSystemUserDataDeleteRequest } from '../models/mgr-system-user-del-request.model';
import { MgrSystemUserDataDelete } from '../models/mgr-system-user-del.model';
import { MgrSystemUserDataQueryRequest } from '../models/mgr-system-user-query-request.model';
import { UserSettingsService } from '../service/user-settings.service';
import { UserSettingsPickListComponent } from './user-settings-pick-list/user-settings-pick-list.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent extends BaseComponent {
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  @ViewChild('tableComponent') tableComponent!: Table; // 表格組件
  @ViewChild('detailTabMenuComponent') detailTabMenuComponent?: TabMenu; // 詳細頁籤組件
  queryForm!: FormGroup; // 表單組對象 !: FormGroup; // 表單組對象
  options: Option[] = []; // 動態下拉選單的 Options 資料
  tableData: UserSettingsDataQueryResponse[] = []; // 表格資料數組
  tableColumns: TableColumn[] = []; // 表格列數組
  rowSelectedData: UserSettingsDataQueryResponse[] = []; // 選中的行數據
  tableStateStorageName = ''; // 顯示幾筆數量儲存在 sessionstorage
  detailTabs: MenuItem[] = []; // 詳細頁籤
  detailTabTableStates: { [tabId: string]: TableState } = {}; // 詳細頁籤表格狀態
  private keepSearchParams?: UserSettingsDataQueryResponse; // 用於儲存搜尋條件的變數
  readonly titleName = '功能權限群組維護 - 使用者設定'; // 頁面標題名稱

  editMenu: MenuItem[] = [
    {
      label: '清空群組對應使用者',
      automationId: '清空群組對應使用者',
      icon: 'pi pi-trash',
      command: () => {
        this.onDetailMenuBatchClearCommand();
      },
    },
  ];

  constructor(private userSettingsService: UserSettingsService) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單組
    this.initTableColumns(); // 初始化表格列
    this.setOptions(); // 初始化下拉式選單
    this.setBtnDeleteDisable(); // 初始化下拉式選單
    this.buttonList = this.authButtonList;
    this.changePermissionStatus();
  }

  /**
   * 初始化表單
   */
  initFormGroup(): void {
    this.queryForm = this.formBuilder.nonNullable.group({
      DBSource: ['', Validators.required],
      GroupId: [''],
      GroupName: [''],
      Status: [''],
      UserId: [''],
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
        header: '群組代碼',
        field: 'GroupId',
        sortable: false,
      },
      {
        header: '群組名稱',
        field: 'GroupName',
        sortable: false,
      },
      {
        header: '狀態',
        field: 'Status',
        sortable: false,
      },
      {
        header: '描述',
        field: 'Remark',
        sortable: false,
      },
      {
        header: '更新日期',
        field: 'ModDateTime',
        sortable: false,
      },
      {
        header: '更新人員',
        field: 'ModUser',
        sortable: false,
      },
    ];
  }

  changePermissionStatus(): void {
    this.editMenu[0].visible = this.buttonList.delete;
  }

  doQuery(isRequery: boolean = false) {
    // 檢查表單是否有效
    if (this.queryForm.invalid) {
      return;
    }
    this.loadingMaskService.show();
    this.tableData = [];
    const params = isRequery
      ? this.keepSearchParams
      : {
          ...this.queryForm.getRawValue(),
          MenuId: this.menuId,
          ButtonType: AuthButtonEnum.QUERY,
          OperatorId: this.userAccount,
        };
    // console.log(params);
    this.setDefaultParams(params);
    this.userSettingsService.getBasicInformationData(params).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        if (response) {
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
          this.clearRowSelectedData();
          this.loadingMaskService.hide();
          this.isSortable();
        }
        // console.log(response);
      },
      error: (error) => {
        this.tableData = [];
        // console.log('this.tableData:', this.tableData);
      },
    });
  }

  // 檢查是否顯示 p-menubar
  get shouldShowMenubar(): boolean {
    return !!this.keepSearchParams;
  }

  /**
   * 清除表單並重置
   */
  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
    this.queryForm.patchValue(this.getUserInfoDefaultParams());

    this.tableComponent.reset(); // 重置分頁到第一頁
    this.tableData = []; // 清空查詢資料
    this.clearRowSelectedData(); // 清除選中行資料
    this.isSortable();
    this.keepSearchParams = undefined;
    this.queryTime = '';
  }

  /**
   * 儲存詳細表格狀態
   * @param {TableState} event - 事件對象
   */
  onDetailTableStateSave(event: TableState): void {
    // console.log('onStateSave = ' + JSON.stringify(event));
    if (this.detailTabs.length > 0 && this.detailTabMenuComponent) {
      const activeItem = this.detailTabMenuComponent.activeItem; // 取得目前活動的頁籤
      if (activeItem) {
        this.detailTabTableStates[activeItem.id!] = event;
      }
    }
    this.setBtnDeleteDisable(); // 設定刪除按鈕是否可用
  }

  /**
   * 開啟新增修改對話框
   * @param {UserSettingsDataQueryResponse} [rowData] - 行數據
   */
  doOpenUpdateDialog(rowData?: UserSettingsDataQueryResponse): void {
    if (rowData && !this.buttonList.update) {
      return;
    }
    const headerTitle = '功能權限群組維護';
    // console.log('Opening dialog with rowData:', rowData);

    const rowDataToSend = { ...rowData, userData: [{}] };

    const params: MgrSystemUserDataQueryRequest = {
      DBSource: rowDataToSend.DBSource || this.keepSearchParams?.DBSource || '',
      GroupId: rowDataToSend.GroupId || '',
      GroupName: rowDataToSend.GroupName || '',
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    // console.log(params);
    this.userSettingsService
      .getMgrSystemUserData(params)
      .subscribe((userData) => {
        // console.log('User data:', userData);
        rowDataToSend.userData = userData;

        this.dialogService
          .open(UserSettingsPickListComponent, {
            header: headerTitle,
            data: rowDataToSend,
            width: '80%',
            closable: false,
          })
          .onClose.subscribe((res) => {
            if (res) {
              this.doQuery(true); // 重新查詢數據
            }
          });
      });
  }

  /**
   * 批次清空指令
   */
  onDetailMenuBatchClearCommand(): void {
    this.systemConfirmationService.confirmClearanceSelected(() => {
      this.clearData();
    }, this.rowSelectedData.length);
  }

  /**
   * 刪除數據
   * @returns {Promise<void>}
   */
  clearData(): void {
    this.loadingMaskService.show();
    // 構造刪除請求的參數

    const list = this.rowSelectedData
      .map((item: MgrSystemUserDataDelete) => item.GroupId)
      .join(',');
    const param: MgrSystemUserDataDeleteRequest = {
      // TODO DBSource
      DBSource:
        this.rowSelectedData[0].DBSource ||
        this.keepSearchParams?.DBSource ||
        '',
      GroupIds: list,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.DELETE,
      OperatorId: this.userAccount,
    };
    // 列印變數值
    // console.log('刪除請求的參數:', list);
    // console.log(param);

    // 檢查 params 是否存在且不為空
    if (this.rowSelectedData.length > 0) {
      this.userSettingsService.deleteMgrUserGroupData(param).subscribe({
        next: (response) => {
          this.loadingMaskService.hide();
          this.handleSuccess('清空成功');
          this.doQuery(true);
        },
      });
    }
  }

  /**
   * 清空選中行資料
   */
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

  /**
   * 處理操作成功
   * @param {string} message
   */
  handleSuccess(message: string): void {
    this.systemMessageService.success(message);
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

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    // console.log(isSort, this.tableColumns);

    if (this.tableComponent) {
      this.tableComponent.reset();
    }
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
}
