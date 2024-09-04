import { AddOrUpdateSystemConfigRequest } from './../models/add-or-update-system-config-request.model';
import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { SystemConfigService } from '../services/system-config.service';
import { MenuItem, TableState } from 'primeng/api';
import { SystemConfigEditComponent } from './system-config-edit/system-config-edit.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { Table } from 'primeng/table';
import { TabMenu } from 'primeng/tabmenu';
import { QuerySystemConfigResponse } from '../models/query-system-config-response.model';
import { Option } from '../../../shared/models/option.model';
import { DeleteSystemConfigRequest } from '../models/delete-system-config-request.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-system-config',
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.scss'],
})
export class SystemConfigComponent extends BaseComponent {
  @ViewChild('detailTabMenuComponent') detailTabMenuComponent?: TabMenu; // 詳細頁籤組件
  @ViewChild('tableComponent') tableComponent!: Table; // 表格組件
  queryForm!: FormGroup; // 表單組對象
  tableColumns: TableColumn[] = []; // 表格列數組
  tableStateStorageName = ''; // 顯示幾筆數量儲存在 sessionstorage
  rowSelectedData: QuerySystemConfigResponse[] = []; // 選中的行數據
  detailTabTableStates: { [tabId: string]: TableState } = {}; // 詳細頁籤表格狀態
  detailTabs: MenuItem[] = []; // 詳細頁籤
  tableData: QuerySystemConfigResponse[] = []; // 表格資料數組
  queryTime: string | null = null; // 資料查詢時間
  options: Option[] = []; // 動態下拉選單的 Options 資料
  private keepSearchParams?: AddOrUpdateSystemConfigRequest; // 用於儲存搜尋條件的變數
  buttonList!: ButtonList;
  readonly titleName = '系統參數設定';

  systemEditMenu: MenuItem[] = [
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
  ];

  constructor(private systemConfigService: SystemConfigService) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單組
    this.initTableColumns(); // 初始化表格列
    this.setOptions(); // 初始化下拉式選單
    this.setBtnDeleteDisable();
    this.buttonList = this.authButtonList;
    this.changePermissionStatus();
  }

  /**
   * 初始化表單
   */
  initFormGroup(): void {
    this.queryForm = this.formBuilder.nonNullable.group({
      DBSource: ['', Validators.required], // 資料庫別
      VarName: ['', [Validators.maxLength(20)]], // 系統變數名稱，最大長度為20
      Number: ['', [Validators.maxLength(4)]], // 序號，最大長度為4
      Value: ['', [Validators.maxLength(20)]], // 設定值，最大長度為20，停用
      VarDesc: ['', [Validators.maxLength(50)]], // 說明，最大長度為50，停用
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
        header: '系統變數名稱',
        field: 'VarName',
        sortable: false,
      },
      {
        header: '序號',
        field: 'Number',
        sortable: false,
      },
      {
        header: '設定值',
        field: 'Value',
        sortable: false,
      },
      {
        header: '說明',
        field: 'VarDesc',
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

  /**
   * 執行查詢
   * @param {boolean} [isRequery=false] - 是否重新查詢
   */
  doQuery(isRequery: boolean = false): void {
    const params = isRequery
      ? this.keepSearchParams
      : {
        ...this.queryForm.getRawValue(),
        MenuId: this.menuId,
        ButtonType: AuthButtonEnum.QUERY,
        OperatorId: this.userAccount,
      }; // 使用暫存的搜尋條件
    this.setDefaultParams(params);
    // console.log(params);
    this.loadingMaskService.show();
    this.systemConfigService.getSystemDataManagement(params).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        this.loadingMaskService.hide();
        if (response) {
          this.keepSearchParams = params;
          this.tableData = response.map((item, index) => {
            const { ModDate, ModTime } = item;
            const dateString = this.tranferColumnService.dateChange(ModDate);
            const timeString = this.tranferColumnService.timeChange(ModTime);
            return {
              ...item,
              ModDateTime: `${dateString} ${timeString}`,
              serialNumber: index + 1,
            };
          });
          this.clearRowSelectedData();
          this.isSortable();
        }
        // console.log(response);
      },
      error: (error) => {
        this.tableData = [];
        // console.log('this.tableData:', this.tableData);
        this.loadingMaskService.hide();
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
    this.tableData = [];
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
   * @param {QuerySystemConfigResponse} [rowData] - 行數據
   */
  doOpenUpdateDialog(rowData?: QuerySystemConfigResponse): void {
    if (rowData && !this.buttonList.update) {
      return;
    }
    const headerTitle = rowData ? '修改系統參數' : '新增系統參數';
    // console.log('Opening dialog with rowData:', rowData);
    const rowDataToSend: any = rowData
      ? { ...rowData }
      : {
        DBSource: this.keepSearchParams?.DBSource,
      };
    this.dialogService
      .open(SystemConfigEditComponent, {
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

  /**
   * 清空選中行資料
   */
  clearRowSelectedData(): void {
    this.rowSelectedData = [];
    this.setBtnDeleteDisable(); // 設定刪除按鈕是否可用
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

  changePermissionStatus(): void {
    this.systemEditMenu[0].visible = this.buttonList.create;
    this.systemEditMenu[1].visible = this.buttonList.delete;
  }

  /**
   * 設置 刪除按鈕是否 disable
   */
  setBtnDeleteDisable(): void {
    // 如果單頭有功能菜單，才要根據單頭功能菜單的操作來控制 Table 上方的功能菜單能不能按
    const btnDelete = this.systemEditMenu.find(
      (menuItem) => menuItem.automationId === '刪除',
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
    this.systemEditMenu = [...this.systemEditMenu];
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
   * 刪除數據
   * @returns {Promise<void>}
   */
  deleteData(): void {
    this.loadingMaskService.show();
    // 構造刪除請求的參數
    const params = {
      DBSource:
        this.rowSelectedData[0].DBSource ||
        this.keepSearchParams?.DBSource ||
        '',
      VN_List: this.rowSelectedData.map((item: DeleteSystemConfigRequest) => ({
        VarName: item.VarName,
        Number: item.Number,
      })),
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.DELETE,
      OperatorId: this.userAccount,
    };

    // 列印變數值
    // console.log('刪除請求的參數:', params);

    // 檢查 params 是否存在且不為空
    if (params.VN_List.length > 0) {
      this.systemConfigService.deleteSystemData(params).subscribe({
        next: (response) => {
          this.loadingMaskService.hide();
          this.doQuery(true);
        },
      });
    }
  }

  /**
   * 處理操作成功
   * @param {string} message
   */
  handleSuccess(message: string): void {
    this.systemMessageService.success(message);
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

  // 檢查是否顯示 p-menubar
  get shouldShowMenubar(): boolean {
    return !!this.keepSearchParams;
  }
}
