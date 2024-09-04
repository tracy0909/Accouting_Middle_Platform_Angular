import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem, TableState } from 'primeng/api';
import { Table } from 'primeng/table';
import { TabMenu } from 'primeng/tabmenu';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { Option } from 'src/app/base/models/option.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { GroupDataDelete } from '../models/group-data-delete.model';
import { GroupDataQueryRequest } from '../models/group-data-query-request.model';
import { GroupDataQueryResponse } from '../models/group-data-query-response.model';
import { BasicInformationService } from '../service/basic-information.service';
import { BasicInformationEditComponent } from './basic-information-edit/basic-information-edit.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-basic-information',
  templateUrl: './basic-information.component.html',
  styleUrls: ['./basic-information.component.scss'],
})
export class BasicInformationComponent extends BaseComponent {
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  @ViewChild('tableComponent') tableComponent!: Table; // 表格組件
  @ViewChild('detailTabMenuComponent') detailTabMenuComponent?: TabMenu; // 詳細頁籤組件
  queryForm!: FormGroup; // 表單組對象 !: FormGroup; // 表單組對象
  options: Option[] = []; // 動態下拉選單的 Options 資料
  tableData: GroupDataQueryResponse[] = []; // 表格資料數組
  tableColumns: TableColumn[] = []; // 表格列數組
  rowSelectedData: GroupDataQueryRequest[] = []; // 選中的行數據
  tableStateStorageName = ''; // 顯示幾筆數量儲存在 sessionstorage
  detailTabs: MenuItem[] = []; // 詳細頁籤
  detailTabTableStates: { [tabId: string]: TableState } = {}; // 詳細頁籤表格狀態
  private keepSearchParams?: GroupDataQueryRequest; // 用於儲存搜尋條件的變數
  readonly titleName = '功能權限群組維護 - 基本資料'; // 頁面標題名稱
  editMenu: MenuItem[] = [
    {
      label: '新增',
      automationId: '新增',
      icon: 'pi pi-plus',
      command: () => {
        this.doOpenUpdateDialog();
      },
    },
    {
      label: '刪除',
      automationId: '刪除',
      icon: 'pi pi-trash',
      command: () => {
        this.detailMenuBatchDeleteCommand();
      },
    },
    {
      label: '停用',
      automationId: '停用',
      icon: 'pi pi-times',
      command: () => {
        this.detailMenuBatchDeactivateCommand();
      },
    },
    {
      label: '啟用',
      automationId: '啟用',
      icon: 'pi pi-check',
      command: () => {
        this.detailMenuBatchEnableCommand();
      },
    },
  ];

  constructor(
    private basicInformationService: BasicInformationService,
    private datePipe: DatePipe,
  ) {
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
    this.editMenu[0].visible = this.buttonList.create;
    this.editMenu[1].visible = this.buttonList.delete;
    this.editMenu[2].visible = this.buttonList.update;
    this.editMenu[3].visible = this.buttonList.update;
  }

  doQuery(isRequery: boolean = false): void {
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
        }; // 使用暫存的搜尋條件
    this.setDefaultParams(params);

    this.basicInformationService.getBasicInformationData(params).subscribe({
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
          this.isSortable();
          this.loadingMaskService.hide();
        }
      },
      error: (error) => {
        this.tableData = [];
      },
    });
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
   * @param {GroupDataQueryRequest} [rowData] - 行數據
   */
  doOpenUpdateDialog(rowData?: GroupDataQueryRequest): void {
    if (rowData && !this.buttonList.update) {
      return;
    }
    const headerTitle = '功能權限群組維護';
    const rowDataToSend = { ...rowData };

    if (rowDataToSend.Status) {
      switch (rowDataToSend.Status) {
        case '啟用':
          rowDataToSend.Status = 'Y';
          break;
        case '停用':
          rowDataToSend.Status = 'N';
          break;
        default:
          break;
      }
    }
    this.dialogService
      .open(BasicInformationEditComponent, {
        header: headerTitle,
        data: rowDataToSend,
        width: '500px',
        closable: false,
      })
      .onClose.subscribe((res) => {
        if (res) {
          this.doQuery(true); // 重新查詢數據
        }
      });
  }

  // 檢查是否顯示 p-menubar
  get shouldShowMenubar(): boolean {
    return !!this.keepSearchParams;
  }

  /**
   * 清空選中行資料
   */
  clearRowSelectedData(): void {
    this.rowSelectedData = [];
    this.setBtnDeleteDisable(); // 設定刪除按鈕是否可用
  }

  /**
   * 設置 按鈕是否 disable
   */
  setBtnDeleteDisable(): void {
    // 查找 新增 按鈕
    const btnAdd = this.editMenu.find(
      (menuItem) => menuItem.automationId === '新增',
    );
    if (btnAdd) {
      btnAdd.disabled = this.tableData.length <= 0;
    }

    // 查找 刪除 按鈕
    const btnDelete = this.editMenu.find(
      (menuItem) => menuItem.automationId === '刪除',
    );
    if (btnDelete) {
      btnDelete.disabled =
        !this.rowSelectedData || this.rowSelectedData.length <= 0;
    }

    // 查找 啟用 按鈕
    const btnEnable = this.editMenu.find(
      (menuItem) => menuItem.automationId === '啟用',
    );
    if (btnEnable) {
      btnEnable.disabled =
        !this.rowSelectedData || this.rowSelectedData.length <= 0;
    }

    // 查找 停用 按鈕
    const btnDisable = this.editMenu.find(
      (menuItem) => menuItem.automationId === '停用',
    );
    if (btnDisable) {
      btnDisable.disabled =
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
   * 批次刪除指令
   */
  detailMenuBatchDeleteCommand(): void {
    this.systemConfirmationService.confirmDeleteSelected(() => {
      this.deleteData();
    }, this.rowSelectedData.length);
  }
  /**
   * 批次停用指令
   */
  detailMenuBatchDeactivateCommand(): void {
    this.systemConfirmationService.confirmDeactivateSelected(() => {
      this.deactivateData();
    }, this.rowSelectedData.length);
  }
  /**
   * 批次啟用指令
   */
  detailMenuBatchEnableCommand(): void {
    this.systemConfirmationService.confirmEnableSelected(() => {
      this.enableData();
    }, this.rowSelectedData.length);
  }

  /**
   * 刪除數據
   * @returns {Promise<void>}
   */
  deleteData(): void {
    this.loadingMaskService.show();

    const list = this.rowSelectedData
      .map((item: GroupDataDelete) => item.GroupId)
      .join(',');
    const param: GroupDataDelete = {
      // TODO DBSource
      DBSource:
        this.rowSelectedData[0].DBSource ||
        this.keepSearchParams?.DBSource ||
        '',
      GroupId: list,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.DELETE,
      OperatorId: this.userAccount,
    };

    // 檢查 params 是否存在且不為空
    if (this.rowSelectedData.length > 0) {
      this.basicInformationService.deleteBasicInformationData(param).subscribe({
        next: (response) => {
          this.loadingMaskService.hide();
          this.handleSuccess('刪除成功');
          this.doQuery(true);
        },
      });
    }
  }

  /**
   * 停用數據
   * @returns {Promise<void>}
   */
  deactivateData(): void {
    this.loadingMaskService.show();
    const modTime = `${this.datePipe.transform(new Date(), 'yyyyMMdd')}`;
    const modDate = `${this.datePipe.transform(new Date(), 'HHmmss')}`;
    // 构造启用请求的参数，将 Status 设置为 'Y'
    // 構造刪除請求的參數
    this.rowSelectedData.map((item: GroupDataQueryRequest) => {
      this.basicInformationService
        .putBasicInformationData({
          DBSource: item.DBSource,
          GroupId: item.GroupId,
          GroupName: item.GroupName,
          Status: 'N',
          Remark: item.Remark,
          ModDate: modDate,
          ModTime: modTime,
          ModUser: '',
          MenuId: this.menuId,
          ButtonType: AuthButtonEnum.UPDATE,
          OperatorId: this.userAccount,
        })
        .subscribe({
          next: (response) => {
            this.loadingMaskService.hide();
            this.doQuery(true);
          },
        });
    });
  }

  /**
   * 啟用數據
   */
  enableData(): void {
    this.loadingMaskService.show();
    const modTime = `${this.datePipe.transform(new Date(), 'yyyyMMdd')}`;
    const modDate = `${this.datePipe.transform(new Date(), 'HHmmss')}`;
    // 构造启用请求的参数，将 Status 设置为 'Y'
    this.rowSelectedData.map((item: GroupDataQueryRequest) => {
      this.basicInformationService
        .putBasicInformationData({
          DBSource: item.DBSource,
          GroupId: item.GroupId,
          GroupName: item.GroupName,
          Status: 'Y',
          Remark: item.Remark,
          ModDate: modDate,
          ModTime: modTime,
          ModUser: '',
          MenuId: this.menuId,
          ButtonType: AuthButtonEnum.UPDATE,
          OperatorId: this.userAccount,
        })
        .subscribe({
          next: (response) => {
            this.loadingMaskService.hide();
            this.doQuery(true);
          },
        });
    });
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
