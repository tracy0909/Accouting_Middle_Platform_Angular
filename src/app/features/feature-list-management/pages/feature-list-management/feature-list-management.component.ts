import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MenuItem, TreeNode } from 'primeng/api';
import { FeatureListManagementService } from '../../services/feature-list-management.service';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { FeatureListManagementDialogComponent } from '../feature-list-management-dialog/feature-list-management-dialog.component';
import { Option } from 'src/app/shared/models/option.model';
import { UserMenu } from '../../models/user-menu.model';
import { RowData } from '../../models/row-data.model';
import { ApiResponse } from '../../models/api-response.model';
import { SearchParams } from '../../models/search-params.model';
import { finalize } from 'rxjs';
import { SetStatusRequest } from '../../models/set-status-request.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
@Component({
  selector: 'app-feature-list-management',
  templateUrl: './feature-list-management.component.html',
  styleUrls: ['./feature-list-management.component.scss'],
})
export class FeatureListManagementComponent extends BaseComponent {
  buttonList!: ButtonList;
  selectedNodes: any = [];
  options: Option[] = []; // 動態下拉選單的 Options 資料
  isAddChild = false;
  data: TreeNode[] = [];
  formGroup!: FormGroup;
  rawData!: UserMenu[];
  // 判斷查詢是否完成(新增 button 是否啟用)
  isQueryComplete: boolean = false;
  tableColumns: TableColumn[] = [];
  queryTime: string | null = null; // 資料查詢時間
  readonly titleName = '功能清單維護';
  systemEditMenu: MenuItem[] = [
    {
      label: '新增',
      automationId: '新增',
      icon: 'pi pi-plus',
      command: () => {
        this.doOpenDialog('postTreeNode');
      },
    },
    {
      label: '新增子節點',
      automationId: '新增子節點',
      icon: 'pi pi-plus',
      disabled: true,
      command: () => {
        this.isAddChild = true;
        this.postTreeNode();
        this.isAddChild = false;
      },
    },
    {
      label: '刪除',
      automationId: '刪除',
      icon: 'pi pi-trash',
      disabled: true,
      command: () => {
        this.detailMenuBatchDeleteCommand();
      },
    },
    {
      label: '停用',
      automationId: '停用',
      icon: 'pi pi-times',
      disabled: true,
      command: () => {
        this.setStatusState(false);
      },
    },
    {
      label: '啟用',
      automationId: '啟用',
      icon: 'pi pi-check',
      disabled: true,
      command: () => {
        this.setStatusState(true);
      },
    },
  ];
  searchParams?: SearchParams;
  lastSearchParams!: SearchParams;

  constructor(
    private featureListManagementService: FeatureListManagementService,
  ) {
    super();
  }

  ngOnInit() {
    this.initTableColumns();
    this.initFormGroup();
    this.setOptions();
    this.buttonList = this.authButtonList;
    this.changePermissionStatus();
  }

  private initTableColumns(): void {
    this.tableColumns = [
      {
        header: '功能代號',
        field: 'ModuleId',
        sortable: true,
      },
      {
        header: '功能名稱',
        field: 'ModuleName',
        sortable: true,
      },
      {
        header: '描述',
        field: 'Remark',
        sortable: true,
      },
      {
        header: '順序',
        field: 'OrderSeq',
        sortable: true,
      },
      {
        header: '狀態',
        field: 'Status',
        sortable: true,
      },
      {
        header: '查詢',
        field: 'I',
        sortable: true,
      },
      {
        header: '新增',
        field: 'A',
        sortable: true,
      },
      {
        header: '修改',
        field: 'U',
        sortable: true,
      },
      {
        header: '刪除',
        field: 'D',
        sortable: true,
      },
      {
        header: '下載',
        field: 'L',
        sortable: true,
      },
      {
        header: '程式路徑',
        field: 'Url',
        sortable: true,
      },
    ];
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      DBSource: ['', [Validators.required]],
      ModuleId: [''],
      ModuleName: [''],
      Status: [''],
    });
    if (this.formGroup.contains('DBSource')) {
      this.formGroup.patchValue(this.getUserInfoDefaultParams());
    }
  }

  /**
   * 設置動態下拉選單的 Options 資料
   */
  private setOptions(): void {
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (options) => {
        this.options = options;
        // 將選項資料轉換為字符串並記錄日誌
        // console.log('setOptions data = ' + JSON.stringify(this.options));
      },
    });
  }

  changeMenustauts(): void {
    // this.systemEditMenu[0].disabled = !this.isQueryComplete;
    // child btn
    this.systemEditMenu[1].disabled = this.selectedNodes.length !== 1;
    // btn delete
    this.systemEditMenu[2].disabled = this.selectedNodes.length === 0;
    // btn stop
    this.systemEditMenu[3].disabled = this.selectedNodes.length === 0;
    // btn active
    this.systemEditMenu[4].disabled = this.selectedNodes.length === 0;
    this.systemEditMenu = [...this.systemEditMenu];
  }

  changePermissionStatus(): void {
    this.systemEditMenu[0].visible = this.buttonList.create;
    this.systemEditMenu[1].visible = this.buttonList.create;
    this.systemEditMenu[2].visible = this.buttonList.delete;
    this.systemEditMenu[3].visible = this.buttonList.update;
    this.systemEditMenu[4].visible = this.buttonList.update;
  }

  statusBatchCommand(): void {
    this.systemConfirmationService.confirmDeleteSelected(() => {
      this.deleteTreeNodes();
    }, this.selectedNodes.length);
  }

  setStatusState(Status: boolean): void {
    this.selectedNodes.forEach((node: TreeNode) => {
      this.featureListManagementService
        .postTreeNodeStatus(this.formStatusParams(node, Status))
        .subscribe((response: ApiResponse) => {
          this.loadingMaskService.hide();
          // console.log(response);
          this.onSearch(this.lastSearchParams);
        });
    });
  }

  formStatusParams(node: TreeNode, Status: boolean): SetStatusRequest {
    return {
      DBSource: this.formGroup.get('DBSource')?.value,
      ModuleId: node.data.ModuleId,
      Status: Status ? 'Y' : 'N',
      MenuId: '',
      ButtonType: '',
      OperatorId: '',
    };
  }

  postTreeNode(): void {
    if (this.isAddChild) {
      if (this.selectedNodes.length == 1) {
        this.doOpenDialog('postChild');
      } else if (this.selectedNodes.length > 1) {
        this.systemMessageService.error('僅能選擇一筆資料列', {
          message: '僅能選擇一筆資料列',
        });
      } else {
        this.systemMessageService.error('請選擇資料列', {
          message: '請選擇一筆資料列',
        });
      }
    }
  }

  formDeleteParams() {
    let ModuleId = '';
    this.selectedNodes.forEach((node: TreeNode, index: number) => {
      if (index == 0) {
        ModuleId = ModuleId + node.data.ModuleId;
      } else {
        ModuleId = ModuleId + ',' + node.data.ModuleId;
      }
    });
    return {
      ModuleId: ModuleId,
      DBSource: this.formGroup.get('DBSource')?.value,
      MenuId: '',
      ButtonType: '',
      OperatorId: '',
    };
  }
  /**
   * 批次刪除指令
   */
  detailMenuBatchDeleteCommand(): void {
    this.systemConfirmationService.confirmDeleteSelected(() => {
      this.deleteTreeNodes();
    }, this.selectedNodes.length);
  }

  deleteTreeNodes(): void {
    this.featureListManagementService
      .deleteTreeNode(this.formDeleteParams())
      .subscribe((response: ApiResponse) => {
        this.loadingMaskService.hide();
        this.onSearch(this.lastSearchParams);
      });
  }

  doOpenDialog(type: string, rowData?: RowData): void {
    if (rowData && !this.buttonList.update) {
      return;
    }
    // console.log('Opening dialog with rowData:', rowData);
    this.dialogService
      .open(FeatureListManagementDialogComponent, {
        header: '系統功能清單資料設定',
        data: {
          DBSource: this.formGroup.get('DBSource')?.value,
          ParentId:
            type == 'postChild' ? this.selectedNodes[0].data.ModuleId : null,
          type: type,
          ...rowData,
        },
        width: '500px',
        closable: false,
      })
      .onClose.subscribe((resp) => {
        if (resp) this.onSearch(this.lastSearchParams); // 重新查詢數據
      });
  }

  convertStatusValue(data: string) {
    if (data == 'Y') {
      return '啟用';
    } else {
      return '停用';
    }
  }

  seacrchAndUpdateParams(): void {
    this.searchParams = {
      ...this.formGroup.value,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    if (this.searchParams) this.onSearch(this.searchParams);
  }
  onSearch(params: SearchParams): void {
    // console.log(params);
    this.setDefaultParams(params);
    this.loadingMaskService.show();
    this.data = [];
    this.featureListManagementService
      .getUserMenu(params)
      .pipe(
        finalize(() => {
          this.loadingMaskService.hide();
        }),
      )
      .subscribe({
        next: (response: UserMenu[]) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          this.rawData = response;
          this.processJson();
          this.data = this.buildTree(this.rawData);
          this.lastSearchParams = params;
          this.selectedNodes = [];
          this.changeMenustauts();
          this.systemEditMenu[0].disabled = false;
        },
        error: (error) => {
          this.data = [];
        },
      });
  }
  // 檢查是否顯示 p-menubar
  get shouldShowMenubar(): boolean {
    return !!this.searchParams;
  }

  // 提示錯誤訊息
  showErrorMessage(name: string): string {
    let formControl = this.formGroup.get(name);
    let errorMessage: string = '';
    if (formControl?.errors?.['required']) {
      errorMessage = `此欄位必須輸入`;
    }
    return errorMessage;
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.formGroup.get('Status')?.setValue(''); // 重置下拉選單
    this.formGroup.patchValue(this.getUserInfoDefaultParams());
    this.data = []; // 重置 treetable
    this.searchParams = undefined;
    this.queryTime = '';
  }

  /** 處理button list */
  processJson(): void {
    this.rawData.forEach((element: RowData) => {
      if (element.ButtonList) {
        element['I'] = element?.ButtonList.includes('I') ? 'Y' : '';
        element['A'] = element?.ButtonList.includes('A') ? 'Y' : '';
        element['U'] = element?.ButtonList.includes('U') ? 'Y' : '';
        element['D'] = element?.ButtonList.includes('D') ? 'Y' : '';
        element['L'] = element?.ButtonList.includes('L') ? 'Y' : '';
      } else {
        element['I'] = '';
        element['A'] = '';
        element['U'] = '';
        element['D'] = '';
        element['L'] = '';
      }
    });
  }

  /** 建立tree table資料結構 */
  buildTree(data: UserMenu[]): TreeNode[] {
    const nodeMap: { [key in string]: any } = {};
    const treeData: TreeNode[] = [];
    data.forEach((item: { ModuleId: string | number }) => {
      nodeMap[item.ModuleId] = {
        data: item,
        children: [],
      };
    });
    data.forEach(
      (item: { ModuleId: string | number; ParentId: string | number }) => {
        const node = nodeMap[item.ModuleId];
        if (item.ParentId) {
          if (nodeMap[item.ParentId]) {
            nodeMap[item.ParentId].children.push(node);
          }
        } else {
          treeData.push(node);
        }
      },
    );
    return treeData;
  }
}
