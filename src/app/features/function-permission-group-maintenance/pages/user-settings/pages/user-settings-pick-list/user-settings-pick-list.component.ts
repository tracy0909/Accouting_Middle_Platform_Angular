import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { MgrSystemUserDataQueryRequest } from '../../models/mgr-system-user-query-request.model';
import { MgrSystemUserDataQueryResponse } from '../../models/mgr-system-user-query-response.model';
import { UserSettingsService } from '../../service/user-settings.service';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-user-settings-pick-list',
  templateUrl: './user-settings-pick-list.component.html',
  styleUrls: ['./user-settings-pick-list.component.scss'],
})
export class UserSettingsPickListComponent extends BaseComponent {
  queryForm!: FormGroup;
  tableColumns: TableColumn[] = []; // 表格列數組
  sourceHeader: string = '';
  targetHeader: string = '';
  selectedData: MgrSystemUserDataQueryResponse[] = [];
  availableData: MgrSystemUserDataQueryResponse[] = [];
  chosenSource: MgrSystemUserDataQueryResponse[] = [];
  chosenSelected: MgrSystemUserDataQueryResponse[] = [];
  buttonList!: ButtonList;

  constructor(
    private userSettingsService: UserSettingsService,
    private dynamicDialogRef: DynamicDialogRef,
    private dynamicDialogConfig: DynamicDialogConfig,
  ) {
    super();
  }

  ngOnInit() {
    this.initFormGroup(); // 初始化表單組
    this.initFormData(); // 初始化表單數據
    this.initTableColumns(); // 初始化表格列
    this.buttonList = this.authButtonList;
    this.doQuery();
  }

  /**
   * 初始化表單組
   */
  initFormGroup(): void {
    this.queryForm = this.formBuilder.nonNullable.group({
      DBSource: [''],
      UserId: [''],
      UserName: [''],
      Role: [''],
      Status: [''],
      GroupId: [''],
      GroupName: [''],
    });
  }

  /**
   * 初始化表單數據
   */
  initFormData(): void {
    const data = this.dynamicDialogConfig?.data;
    // console.log(data);
    if (data) {
      this.queryForm.patchValue({
        DBSource: data.DBSource,
        GroupId: data.GroupId,
        GroupName: data.GroupName,
      });
    }
  }

  /**
   * 初始化表格列
   */
  initTableColumns(): void {
    this.tableColumns = [
      {
        header: '使用者代碼',
        field: 'UserId',
        sortable: true,
      },
      {
        header: '使用者名稱',
        field: 'UserName',
        sortable: true,
      },
    ];
  }

  /**
   * 查询数据
   */
  doQuery(): void {
    const queryParams: MgrSystemUserDataQueryRequest = {
      ...this.queryForm.value,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    // console.log(queryParams);
    this.userSettingsService
      .getMgrSystemUserData(queryParams)
      .subscribe((data) => {
        // 選擇 FuctionGroup 包含指定 GroupId 的用戶
        this.availableData = data.filter(
          (user) =>
            !this.isGroupSelected(user.FuctionGroup, queryParams.GroupId),
        );
        // console.log('Fetched data:', data);
        // console.log('Selected Data:', this.selectedData);
        this.selectedData = data.filter((user) =>
          this.isGroupSelected(user.FuctionGroup, queryParams.GroupId),
        );
        // 選擇 FuctionGroup 不包含指定 GroupId 的用戶
        // console.log('Available Data:', this.availableData);
      });
  }

  onSaveData(): void {
    this.loadingMaskService.show();
    const list = this.selectedData
      .map((item: MgrSystemUserDataQueryResponse) => item.UserId)
      .join(',');
    const { DBSource } = this.dynamicDialogConfig?.data;
    const param = {
      DBSource,
      GroupId: this.queryForm.get('GroupId')?.value,
      UserList: list,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.UPDATE,
      OperatorId: this.userAccount,
    };

    // console.log(list);

    this.userSettingsService.putBasicInformationData(param).subscribe({
      next: (response) => {
        this.loadingMaskService.hide();
        console.log('Data saved successfully', response);
        this.handleSuccess('儲存成功');
        this.onCloseDialog();
      },
    });
  }

  /**
   * 關閉對話框
   */
  onCloseDialog(): void {
    this.dynamicDialogRef.close();
  }

  /**
   * 清除表單並重置
   */
  onClearForm() {
    this.onMoveAllToUnSelected();
  }

  onMoveToSelected() {
    this.selectedData = this.selectedData.concat(this.chosenSource);
    this.availableData = this.availableData.filter(
      (element) => !this.chosenSource.includes(element),
    );
    this.chosenSource = [];
  }

  onMoveToUnSelected() {
    this.availableData = this.availableData.concat(this.chosenSelected);
    this.selectedData = this.selectedData.filter(
      (element) => !this.chosenSelected.includes(element),
    );
    this.chosenSelected = [];
  }

  onMoveAllToSelected() {
    this.selectedData = this.selectedData.concat(this.availableData);
    this.availableData = [];
  }

  onMoveAllToUnSelected() {
    this.availableData = this.availableData.concat(this.selectedData);
    this.selectedData = [];
  }

  private isGroupSelected(fuctionGroup: string, groupId: string): boolean {
    // 如果 GroupId 為空，則預設顯示所有數據
    if (!groupId) {
      return true;
    }
    return fuctionGroup.split(',').includes(groupId);
  }

  /**
   * 處理操作成功
   * @param {string} message
   */
  handleSuccess(message: string): void {
    this.systemMessageService.success(message);
  }
}
