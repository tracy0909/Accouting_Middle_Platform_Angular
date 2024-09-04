import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { BranchStatusQueryResponse } from '../../models/branch-status-query-response.model';
import { BranchStatusQueryService } from '../../services/branch-status-query.service';
import { BranchStatusQueryDataEnum } from '../../enum/branch-status-query.enum';
@Component({
  selector: 'app-branch-status-query',
  templateUrl: './branch-status-query.component.html',
  styleUrls: ['./branch-status-query.component.scss'],
})
export class BranchStatusQueryComponent extends BaseComponent {
  @ViewChild('tableCopmonent') tableCopmonent!: Table; // 表格組件
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '分公司結帳狀態查詢'; // 頁面標題名稱
  tableData: BranchStatusQueryResponse[] = [];
  formGroup!: FormGroup;
  options: Option[] = []; // 動態下拉選單的 Options 資料
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料

  /** 紀錄下載查詢條件 */
  tableColumns: TableColumn[] = [
    {
      header: '分公司',
      field: 'bhno',
      sortable: true,
    },
    {
      header: '項目',
      field: 'category',
      sortable: true,
    },
  ];

  checkSum: { [key: string]: any[] } = {};

  dataCategoriesCode: string[] = ['SettFlag', 'AdjFlag'];
  dataCategories: string[] = ['結帳狀態', '調整成本 / 自訂資金'];

  constructor(private branchStatusQueryService: BranchStatusQueryService) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.buttonList = this.authButtonList;
    this.setOptions(); // 初始化下拉式選單
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      bhno: [''],
      // BhNo: ['', [Validators.required]],
    });
  }

  onSearch(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.checkSum = {};

    const params = {
      ...this.formGroup.value,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.setDefaultParams(params);
    this.loadingMaskService.show();
    this.branchStatusQueryService.getBranchStatus(params).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });

        this.checkSum = this.processData(response);
        this.loadingMaskService.hide();
        this.isSortable();
      },

      error: () => {
        this.checkSum = {};
        this.loadingMaskService.hide();
      },
    });
  }

  isSortable(): void {
    const isSort = this.objectKeys.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));

    if (this.tableCopmonent) {
      this.tableCopmonent.reset();
    }
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

  /**
   * 獲取表單控件
   * @param {string} formControlName 表單控件名稱
   * @returns {FormControl} 表單控件
   */
  formControl(formControlName: string): FormControl {
    return this.formGroup.get(formControlName) as FormControl;
  }

  /**
   * 檢查表單控件是否無效
   * @param {string} formControlName 表單控件名稱
   * @returns {boolean} 表單控件是否無效
   */
  formControlInvalid(formControlName: string): boolean {
    const formControl = this.formGroup.get(formControlName);
    return formControl
      ? formControl.invalid && (formControl.dirty || formControl.touched)
      : false;
  }

  setOptions(): void {
    this.optionService.branchOfficesDbSourceOptions().subscribe({
      next: (branchOptions) => {
        this.branchOptions = branchOptions;
        const { bhno, cseq } = this.getDefaultParams();
        let bhnoValue =
          !bhno && this.branchOptions.length > 0
            ? ''
            : bhno;
        this.formGroup.patchValue({ bhno: bhnoValue, cseq });
      },
    });
  }

  onClearForm(): void {
    this.formGroup.reset();
    this.checkSum = {};
    this.queryTime = '';
    this.isSortable();
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: '' });
    }
  }

  processData(rawData: any): { [key: string]: any[] } {
    const result: { [key: string]: any[] } = {};
    const settFlagMappings: { [key: string]: string } = {
      N: 'N-未結帳',
      I: 'I-結帳中',
      C: 'C-抄寫中',
      Y: 'Y-已結帳',
    };

    const adjFlagMappings: { [key: string]: string } = {
      Y: 'Y-開放',
      N: 'N-關閉',
    };

    rawData.forEach((queryList: any) => {
      const {
        DB_list: { DBName, BHNO_list },
      } = queryList.QUERY_list;

      if (!this.tableColumns.some((column) => column.header === DBName)) {
        this.tableColumns.push({
          header: DBName,
          field: DBName,
          sortable: true,
        });
      }

      BHNO_list.forEach(({ Bhno, ...bhnoData }: any) => {
        if (!result[Bhno]) {
          result[Bhno] = this.dataCategories.map((category) => ({
            bhno: Bhno,
            category,
          }));
        }

        this.dataCategoriesCode.forEach((code, index) => {
          let value = bhnoData[code];

          if (code === 'SettFlag') {
            value = settFlagMappings[value] || value;
          }

          if (code === 'AdjFlag') {
            value = adjFlagMappings[value] || value;
          }

          result[Bhno][index][DBName] = value;
        });
      });
    });

    // console.log(result);

    return result;
  }

  get objectKeys(): string[] {
    return Object.keys(this.checkSum);
  }
  get BranchStatusQueryDataEnum() {
    return BranchStatusQueryDataEnum;
  }
}
