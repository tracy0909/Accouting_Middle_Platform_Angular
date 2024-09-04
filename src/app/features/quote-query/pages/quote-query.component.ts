import { Component, ViewChildren } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Table } from 'primeng/table';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { AddUserLogsService } from 'src/app/shared/services/add-user-logs.service';
import { Option } from '../../../shared/models/option.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import {
  QuoteQueryResponse,
  QuoteServer,
} from '../models/quote-query-response.model';
import { QuoteQueryService } from './../services/quote-query.service';

@Component({
  selector: 'app-quote-query',
  templateUrl: './quote-query.component.html',
  styleUrls: ['./quote-query.component.scss'],
})
export class QuoteQueryComponent extends BaseComponent {
  @ViewChildren('quoteTable') quoteTable!: Table[];
  // 輸入表單的 FormGroup，在 initFormGroup() 初始化
  formGroup!: FormGroup;
  // 下拉選單選項
  options: Option[] = [];
  // Table 的欄位設定
  tableColumns: TableColumn[] = [];
  // 表格資料陣列
  tableData: QuoteServer[] = [];
  // 資料查詢時間
  queryTime: string | null = null;
  // 表格上顯示報價主機名稱
  apiNames: string[] = [];
  // 表格上顯示報價主機 IP 名稱
  apiTargets: string[] = [];
  readonly titleName = '報價查詢'; // 頁面標題名稱
  buttonList!: ButtonList;

  constructor(
    private quoteQueryService: QuoteQueryService,
    private addUserLogsService: AddUserLogsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initTableColumns();
    this.initFormData();
    this.buttonList = this.authButtonList;
  }

  // 初始化表單
  private initFormGroup(): void {
    this.formGroup = this.formBuilder.nonNullable.group({
      stock: ['', [Validators.required, this.stockValidator()]],
    });
  }

  // 初始化表格
  private initTableColumns(): void {
    this.tableColumns = [
      // { header: '報價主機', field: 'endpoint', sortable: true },
      { header: '股票代碼', field: 'id', sortable: false },
      { header: '股票名稱', field: 'shortname', sortable: false },
      {
        header: '成交價',
        field: 'dealprice',
        sortable: false,
        numberField: true,
      },
      {
        header: '參考價',
        field: 'refprice',
        sortable: false,
        numberField: true,
      },
      { header: '更新日期', field: 'moddate', sortable: false },
      { header: '更新時間', field: 'modtime', sortable: false },
    ];
  }

  // 設定 Table 欄位
  private initFormData(): void {
    this.quoteQueryService.loadServerConfig().subscribe({
      next: (data) => {
        this.tableData = data.map((item) => ({
          ...item,
          data: [] as QuoteQueryResponse[],
        }));
        this.isSortable();
        this.apiNames = data.map((item) => item.name);
        this.apiTargets = data.map((item) => item.target);
        // console.log('this.tableData', this.tableData);
      },
      error: (error) => {
        console.error('Error loading server config:', error);
      },
    });
  }

  // 查詢
  doQuery(): void {
    if (this.quoteTable) {
      this.quoteTable.forEach((item) => {
        item.reset();
        item.value = [];
      });
    }
    // 倘表單有錯，將表單中的欄位標示為 touch，不進行查詢
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    // 重製表格
    this.quoteTable.forEach((table) => {
      table.reset();
    });
    // 取表單的值
    const params = {
      stock: this.getStockValue(),
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    const log = {
      ModuleId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      UserId: this.userAccount,
      Remark: JSON.stringify(params),
    };
    this.addUserLogsService.addUserLog(log);
    // console.log('params', params);
    this.tableData.forEach((api, index) => {
      this.quoteQueryService.getQuoteQueryData(params, api).subscribe({
        next: (data) => {
          // 轉日期時間格式
          data.forEach((item) => {
            item.moddate = this.tranferColumnService.dateChange(item.moddate);
            item.modtime = this.tranferColumnService.timeChange(item.modtime);
          });
          // 將轉換後資料帶入 data[]
          // api.data = [];
          this.tableData[index].data = data;
          this.isSortable();

          // 資料查詢時間
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          // console.log('Fetched data:', this.tableData);
        },
        error: () => {
          // api.data = [];
          this.tableData[index].data = [];
        },
      });
    });
  }

  // 清除
  onClear(): void {
    // 重製表單
    this.formGroup.reset();
    // 重製表格
    if (this.quoteTable) {
      this.quoteTable.forEach((item) => {
        item.reset();
        item.value = [];
      });
    }
    // 重製查詢時間
    this.queryTime = '';
    // 清除 Autocomplete 的值
    this.formGroup.get('stock')?.setValue([]);
    // 移除排序
    this.isSortable(true);
  }

  // 資料只有單筆的話，取消排序
  isSortable(onClear: boolean = false): void {
    const isSort = onClear ? false : this.tableData[0].data.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));

    // console.log('this.tableColumns', isSort, this.tableColumns);
    if (this.quoteTable) {
      this.quoteTable.forEach((item) => {
        item.reset();
      });
    }
  }

  // 表單的值若為空值，顯示紅框警告
  formControlInvalid(stork: string): boolean {
    const formControl = this.formGroup.get(stork);
    return formControl
      ? formControl.invalid && (formControl.dirty || formControl.touched)
      : false;
  }

  // 判斷股票代碼數量不超過10筆
  private stockValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const isValidCount = value.length <= 10;
      return isValidCount ? null : { stockCode: true };
    };
  }

  // 搜尋詞表單控制項
  get stockControl(): FormControl {
    return this.formGroup.get('stock') as FormControl;
  }

  // 股票代號多筆時，以逗號隔開傳入
  getStockValue() {
    let stockString = '';
    const { stock } = this.formGroup.value;
    if (Array.isArray(stock)) {
      stock.forEach((item, index) => {
        stockString =
          index === 0
            ? stockString.concat(item.Stock)
            : stockString.concat(`,${item.Stock}`);
        // console.log(stockString);
      });
    }
    return stockString;
  }
}
