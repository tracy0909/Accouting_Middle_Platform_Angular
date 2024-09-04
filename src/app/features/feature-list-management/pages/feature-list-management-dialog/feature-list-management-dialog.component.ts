import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FeatureListManagementService } from '../../services/feature-list-management.service';
import { DialogParams } from '../../models/dialog-params.model';
import { ApiResponse } from '../../models/api-response.model';
import { finalize } from 'rxjs';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-feature-list-management-dialog',
  templateUrl: './feature-list-management-dialog.component.html',
  styleUrls: ['./feature-list-management-dialog.component.scss'],
})
export class FeatureListManagementDialogComponent extends BaseComponent {
  buttons: { name: string; key: string; formName: string }[] = [
    { name: '查詢', key: 'I', formName: 'searchBtn' },
    { name: '新增', key: 'A', formName: 'createBtn' },
    { name: '修改', key: 'U', formName: 'editBtn' },
    { name: '刪除', key: 'D', formName: 'deleteBtn' },
    { name: '下載', key: 'L', formName: 'downloadBtn' },
  ];
  openMethodOptions: string[] = ['', '另開視窗', '同一視窗'];
  formGroup!: FormGroup;
  dialogParams!: DialogParams;
  isEdit: boolean = this.config?.data.type == 'editTreeNode';
  buttonList!: ButtonList;
  constructor(
    private featureListManagementService: FeatureListManagementService,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initFormData();
    this.buttonList = this.authButtonList;
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      ModuleId: ['', [Validators.required]],
      OrderSeq: [0, [Validators.required]],
      ParentId: [''],
      Status: ['', [Validators.required]],
      ModuleName: ['', [Validators.required]],
      Remark: ['', [Validators.required]],
      Url: [''],
      Level: [0, [Validators.required]],
    });
    this.buttons.forEach((btn) => {
      this.formGroup.addControl(btn.formName, this.formBuilder.control(false));
    });
  }

  /**
   * 初始化表單數據
   */
  private initFormData(): void {
    const data = this.config?.data;
    if (data && data.type == 'editTreeNode') {
      this.formGroup.patchValue({
        ModuleId: data.ModuleId,
        OrderSeq: data.OrderSeq,
        Level: data.Level,
        ParentId: data.ParentId,
        Status: data.Status == 'Y' ? '啟用' : '停用',
        ModuleName: data.ModuleName,
        Remark: data.Remark,
        Url: data.Url,
        searchBtn: data.I != '',
        createBtn: data.A != '',
        editBtn: data.U != '',
        deleteBtn: data.D != '',
        downloadBtn: data.L != '',
      });
      this.formGroup.get('ModuleId')?.disable();
    } else if (data && data.type == 'postChild') {
      this.formGroup.patchValue({
        ParentId: data.ParentId,
        Status: '啟用',
      });
      this.formGroup.get('ParentId')?.disable();
    } else {
      this.formGroup.patchValue({
        Status: '啟用',
      });
    }
  }

  deleteTreeNode(): void {
    this.systemConfirmationService.confirmDeleteSelected(() => {
      const params = {
        ModuleId: this.config?.data.ModuleId,
        DBSource: this.config.data.DBSource,
        MenuId: this.menuId,
        ButtonType: AuthButtonEnum.DELETE,
        OperatorId: this.userAccount,
      };
      // console.log(params);
      this.featureListManagementService
        .deleteTreeNode(params)
        .pipe(
          finalize(() => {
            this.loadingMaskService.hide();
          }),
        )
        .subscribe((response: ApiResponse) => {
          this.ref.close('delete');
        });
    }, 1);
  }

  encodeButtonList(): string {
    let result = '';
    this.buttons.forEach((button, index) => {
      if (this.formGroup.get(button.formName)?.value) {
        if (index == 0) {
          result = result + button.key;
        } else {
          result = result + ',' + button.key;
        }
      }
    });
    return result;
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

  formParams(): DialogParams {
    const buttonType = this.isEdit
      ? AuthButtonEnum.UPDATE
      : AuthButtonEnum.CREATE;

    return {
      DBSource: this.config.data.DBSource,
      ModuleId: this.formGroup.get('ModuleId')?.value || '',
      ModuleName: this.formGroup.get('ModuleName')?.value || '',
      Level: this.formGroup.get('Level')?.value,
      ParentId: this.formGroup.get('ParentId')?.value || '',
      Url: this.formGroup.get('Url')?.value || '',
      Remark: this.formGroup.get('Remark')?.value || '',
      Status: this.formGroup.get('Status')?.value == '啟用' ? 'Y' : 'N',
      OrderSeq: this.formGroup.get('OrderSeq')?.value,
      ButtonList: this.encodeButtonList(),
      MenuId: this.menuId,
      ButtonType: buttonType,
      OperatorId: this.userAccount,
    };
  }
  onEdit(): void {
    this.dialogParams = this.formParams();
    this.loadingMaskService.show();
    // console.log(this.dialogParams);
    this.featureListManagementService
      .putTreeNode(this.dialogParams)
      .pipe(
        finalize(() => {
          this.loadingMaskService.hide();
        }),
      )
      .subscribe((response: ApiResponse) => {
        this.ref.close('edit');
      });
  }

  onPost(): void {
    this.dialogParams = this.formParams();
    this.loadingMaskService.show();
    // console.log(this.dialogParams);
    this.featureListManagementService
      .postTreeNode(this.dialogParams)
      .pipe(
        finalize(() => {
          this.loadingMaskService.hide();
        }),
      )
      .subscribe((response: ApiResponse) => {
        this.ref.close('post');
      });
  }

  onSave(): void {
    if (this.config?.data.type == 'editTreeNode') {
      this.onEdit();
    } else {
      this.onPost();
    }
  }

  onCloseDialog(): void {
    this.ref.close();
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    if (this.config.data.ModuleId) {
      this.formGroup.patchValue({
        ModuleId: this.config.data.ModuleId,
      });
    }
  }
}
