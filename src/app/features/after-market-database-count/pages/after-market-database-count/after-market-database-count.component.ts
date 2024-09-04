import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { AfterMarketDatabaseCountService } from '../../services/after-market-database-count.service';
import { DatePipe } from '@angular/common';
import { SearchParams } from '../../models/search-params.model';
import { QueryList } from '../../models/query-list.model';
import { BhnoList } from '../../models/bhno-list.model';
import { AfterMarketDatabaseCountEnum } from '../../enum/after-market-datebase-count.enum';

@Component({
  selector: 'app-after-market-database-count',
  templateUrl: './after-market-database-count.component.html',
  styleUrls: ['./after-market-database-count.component.scss'],
})
export class AfterMarketDatabaseCountComponent extends BaseComponent {
  checkSum: { [key: string]: { [key: string]: string | boolean | number }[] } =
    {};
  dataCategoriesCode: string[] = [
    'Hcmio',
    'Hcnrh',
    'Hcrrh',
    'Hdbrh',
    'Hcdtd',
    'Tcnud',
    'Tcrud',
    'Tdbud',
    'Adjco',
    'Hrhod',
    'Hcntd',
  ];
  dataCategories: string[] = [
    '交易明細',
    '現股沖銷',
    '融資沖銷',
    '融劵沖銷',
    '當日沖銷',
    '現股餘額',
    '融資餘額',
    '融劵餘額',
    '調整成本',
    '融資現償',
    '現股當沖',
  ];
  @ViewChild('tableCopmonent') tableCopmonent!: Table; // 表格組件
  hasSearched: boolean = false; // 用於追蹤是否已進行查詢
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  readonly titleName = '盤後資料庫筆數'; // 頁面標題名稱
  formGroup!: FormGroup;
  branchOptions: Option[] = []; // 動態下拉選單的 Options 資料
  statusOptions: Option[] = [];
  /** 紀錄下載查詢條件 */
  searchParams!: SearchParams;
  tableColumns: TableColumn[] = [
    {
      header: '分公司',
      field: 'bhno',
      sortable: false,
    },
    {
      header: '項目',
      field: 'category',
      sortable: true,
    },
  ];

  constructor(
    private afterMarketDatabaseCountService: AfterMarketDatabaseCountService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.buttonList = this.authButtonList;
    this.setOptions(); // 初始化下拉式選單
    this.setFormValue();
  }

  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      bhno: [''],
      TDate: [''],
      Status: [''],
    });
  }

  onSearch(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.checkSum = {};
    const { TDate } = this.formGroup.value;
    this.searchParams = {
      ...this.formGroup.getRawValue(),
      TDate: this.datePipe.transform(TDate, 'yyyyMMdd') ?? '',
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
      bhno: this.formGroup.value.bhno === null ? '' : this.formGroup.value.bhno,
    };
    this.loadingMaskService.show();
    this.afterMarketDatabaseCountService
      .getCheckSums(this.searchParams)
      .subscribe({
        next: (response) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          this.checkSum = this.filterCheckSum(this.processData(response));
          this.hasSearched = true; // 設置為已查詢
          this.loadingMaskService.hide();
        },
        error: (error) => {
          this.checkSum = {};
          this.loadingMaskService.hide();
        },
      });
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
        let bhnoValue = !bhno && this.branchOptions.length > 0 ? '' : bhno;
        this.formGroup.patchValue({ bhno: bhnoValue, cseq });
      },
    });

    this.statusOptions = [
      {
        id: '',
        label: '全部',
        value: 'All',
      },
      {
        id: '',
        label: '異常',
        value: '0',
      },
      {
        id: '',
        label: '正常',
        value: '1',
      },
    ];
  }

  onClearForm(): void {
    this.formGroup.reset(); // 重置表單
    this.checkSum = {}; // 清除 table
    this.hasSearched = false;
    this.setFormValue();
    this.queryTime = '';
    if (this.branchOptions.length > 0) {
      this.formGroup.patchValue({ bhno: '' });
    }
  }

  // 設定表單日期初始值的方法
  private setFormValue(): void {
    this.formGroup.get('TDate')?.setValue(new Date());
    this.formGroup.get('Status')?.setValue(this.statusOptions[0].value);
  }

  processData(rawData: QueryList[]): {
    [key: string]: { [key: string]: string | boolean | number }[];
  } {
    const result: {
      [key: string]: { [key: string]: string | boolean | number }[];
    } = {};

    rawData.forEach((queryList: QueryList) => {
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

      BHNO_list.forEach(({ Bhno, ...bhnoData }: BhnoList) => {
        if (!result[Bhno]) {
          result[Bhno] = this.dataCategories.map((category) => ({
            bhno: Bhno,
            category,
            isNormal: true,
          }));
        }

        this.dataCategoriesCode.forEach((code, index) => {
          result[Bhno][index][DBName] = bhnoData[code as keyof typeof bhnoData];
        });
      });
    });

    Object.keys(result).forEach((bhno) => {
      const rows = result[bhno];

      if (rows.length > 0) {
        const referenceRow = rows[0];
        const dbNames = this.tableColumns.map((col) => col.header);

        rows.forEach((row) => {
          dbNames.forEach((dbName) => {
            if (referenceRow[dbName] !== row[dbName]) {
              row['isNormal'] = false;
            }
          });
        });
      }
    });
    return result;
  }

  get objectKeys(): string[] {
    return Object.keys(this.checkSum);
  }

  get statusValue(): string {
    return this.formControl('Status')?.value;
  }
  filterCheckSum(data: {
    [key: string]: { [key: string]: string | boolean | number }[];
  }): {
    [key: string]: { [key: string]: string | boolean | number }[];
  } {
    if (this.statusValue === 'All') {
      return data;
    }
    const filteredData: {
      [key: string]: { [key: string]: string | boolean | number }[];
    } = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        filteredData[key] = data[key].filter(
          // item為動態產所以為any
          (item: any) => item.isNormal === (this.statusValue === '1'),
        );
      }
    }
    return filteredData;
  }

  get AfterMarketDatabaseCountEnum() {
    return AfterMarketDatabaseCountEnum;
  }
}
