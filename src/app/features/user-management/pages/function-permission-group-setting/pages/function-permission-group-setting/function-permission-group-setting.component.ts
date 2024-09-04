import { Component, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { finalize } from 'rxjs';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { ApiResponse } from '../../models/api-response.model';
import { SystemUser } from '../../models/system-user.mode';
import { SystemUserGetRequest } from '../../models/systemuser-get-request.model';
import { FunctionPermissionGroupSettingService } from '../../services/function-permission-group-setting.service';
import { FunctionPermissionGroupSettingDialogComponent } from '../function-permission-group-setting-dialog/function-permission-group-setting-dialog.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
@Component({
  selector: 'app-function-permission-group-setting',
  templateUrl: './function-permission-group-setting.component.html',
  styleUrls: ['./function-permission-group-setting.component.scss'],
})
export class FunctionPermissionGroupSettingComponent extends BaseComponent {
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  // Table
  @ViewChild('tableComponent') tableComponent!: Table;
  selectedUsers: SystemUser[] = [];
  lastSearchParams!: SystemUserGetRequest;
  searchParams!: SystemUserGetRequest;
  tableData!: SystemUser[];
  formGroup!: FormGroup;
  tableColumns: TableColumn[] = [];
  options: Option[] = []; // 動態下拉選單的 Options 資料
  readonly titleName = '  使用者維護 - 功能權限群組設定'; // 頁面標題名稱

  systemEditMenu: MenuItem[] = [
    {
      label: '清空使用者功能群組	',
      automationId: '清空使用者功能群組	',
      icon: 'pi pi-trash',
      disabled: true,
      command: () => {
        this.onDetailMenuBatchClearCommand();
      },
    },
  ];
  constructor(
    private functionPermissionGroupSettingService: FunctionPermissionGroupSettingService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單組
    this.initTableColumns(); // 初始化表格列
    this.setOptions(); // 初始化下拉式選單
    this.buttonList = this.authButtonList;
    this.changePermissionStatus();
  }

  /**
   * 初始化表單
   */
  initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      DBSource: [''],
      UserId: [''],
      UserName: [''],
      Role: [''],
      Status: [''],
      GroupId: [''],
    });
    if (this.formGroup.contains('DBSource')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
  }

  /**
   * 初始化表格列
   */
  initTableColumns(): void {
    this.tableColumns = [
      {
        header: '帳號',
        field: 'UserId',
        sortable: true,
      },
      {
        header: '姓名',
        field: 'UserName',
        sortable: true,
      },
      {
        header: '角色',
        field: 'Role',
        sortable: true,
      },
      {
        header: '狀態',
        field: 'Status',
        sortable: true,
      },
      {
        header: '功能群組',
        field: 'FuctionGroup',
        sortable: true,
      },
    ];
  }

  changePermissionStatus(): void {
    this.systemEditMenu[0].visible = this.buttonList.delete;
  }

  updateParams(): void {
    this.tableData = [];
    this.searchParams = {
      ...this.formGroup.value,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.onSearch(this.searchParams);
  }

  private onSearch(params: SystemUserGetRequest): void {
    this.loadingMaskService.show();

    this.functionPermissionGroupSettingService
      .getMgrSystemUser(params)
      .subscribe({
        next: (response: SystemUser[]) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          this.tableData = response.map((item, index) => ({
            ...item,
            serialNumber: index + 1,
          }));
          this.setDefaultParams(params);
          this.lastSearchParams = this.searchParams;
          this.selectedUsers = [];
          this.isSortable();
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.tableData = [];
          // console.log('this.tableData', this.tableData);
          this.loadingMaskService.hide();
        },
      });
  }

  private setOptions(): void {
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (options) => {
        this.options = options;
      },
    });
  }

  // 檢查是否顯示 p-menubar
  get shouldShowMenubar(): boolean {
    return !!this.searchParams;
  }

  doOpenDialog(type: string, rowData?: SystemUser): void {
    if (!this.buttonList.update) {
      return;
    }
    this.dialogService
      .open(FunctionPermissionGroupSettingDialogComponent, {
        header: '系統功能清單資料設定',
        data: {
          DBSource: this.formGroup.get('DBSource')?.value,
          ...rowData,
        },
        width: '80%',
      })
      .onClose.subscribe((resp) => {
        if (resp) {
          this.onSearch(this.lastSearchParams);
        } // 重新查詢數據
      });
  }

  onSelect() {
    this.systemEditMenu[0].disabled = this.selectedUsers.length === 0;
    this.systemEditMenu = [...this.systemEditMenu];
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.formGroup.patchValue(this.getUserInfoDefaultParams());

    this.tableData = [];
    this.isSortable();
    this.selectedUsers = [];
    this.onSelect();
    this.queryTime = '';
  }

  /**
   * 批次清空指令
   */
  onDetailMenuBatchClearCommand(): void {
    this.systemConfirmationService.confirmClearanceSelected(() => {
      this.deleteMgrUserGroup();
    }, this.selectedUsers.length);
  }

  deleteMgrUserGroup(): void {
    let apiParams = {
      DBSource: this.formGroup.get('DBSource')?.value,
      UserIds: '',
      MenuId: '',
      ButtonType: '',
      OperatorId: '',
    };
    this.selectedUsers.forEach((user: SystemUser, index: number) => {
      if (index == 0) {
        apiParams['UserIds'] = apiParams['UserIds'] + user.UserId;
      } else {
        apiParams['UserIds'] = apiParams['UserIds'] + ',' + user.UserId;
      }
    });

    this.functionPermissionGroupSettingService
      .deleteMgrUserGroup(apiParams)
      .pipe(
        finalize(() => {
          this.loadingMaskService.hide();
        }),
      )
      .subscribe((response: ApiResponse) => {
        if (response) {
          this.onSearch(this.lastSearchParams);
        } // 重新查詢數據
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
}
