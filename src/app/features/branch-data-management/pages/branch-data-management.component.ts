import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BranchDataManagementService } from '../services/branch-data-management.service';
import { TableColumn } from 'src/app/base/models/table-column.model';
import { BranchDataManagementResponse } from '../models/branch-data-management-response.model';
import { Table } from 'primeng/table';
import { Option } from '../../../shared/models/option.model';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';
import { concatMap } from 'rxjs';
import { ExchangeRateOption } from '../../unreal-pnl-total-query/models/exchange-rate-option.model';

@Component({
  selector: 'app-branch-data-management',
  templateUrl: './branch-data-management.component.html',
  styleUrls: ['./branch-data-management.component.scss'],
})
export class BranchDataManagementComponent extends BaseComponent {
  @ViewChild('branchTable') branchTable!: Table; // 表格對象，用於訪問表格實例
  queryForm!: FormGroup; //表單組對象，用於管理表單的狀態和驗證
  tableData: BranchDataManagementResponse[] = []; // 表格資料數組
  tableColumns: TableColumn[] = []; // 表格列數組
  options: Option[] = []; // 動態下拉選單的 Options 資料
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  exchangeRateOptions: ExchangeRateOption[] = [];

  readonly titleName = '分公司資料維護';

  constructor(
    private branchDataManagementService: BranchDataManagementService,
  ) {
    super();
  }

  // 初始化方法，在元件初始化時呼叫
  ngOnInit(): void {
    this.initFormGroup(); // 初始化表單組
    this.initTableColumns(); // 初始化表格列
    this.setOptions(); // 初始化下拉式選單
    this.buttonList = this.authButtonList;
  }

  // 初始化表單
  initFormGroup(): void {
    this.queryForm = this.formBuilder.nonNullable.group({
      DBSource: ['', Validators.required], // 資料庫別
      BhNo: ['', [Validators.maxLength(4)]], // 分公司代碼字段，最大長度為4
      BhName: ['', [Validators.maxLength(16)]],
    });
    if (this.queryForm.contains('DBSource')) {
      this.queryForm.patchValue(this.getUserInfoDefaultParams());
    }
  }

  // 初始化表格列
  private initTableColumns(): void {
    this.tableColumns = [
      {
        header: '分公司代碼',
        field: 'BhNo',
        sortable: false,
      },
      {
        header: '分公司名稱',
        field: 'BhName',
        sortable: false,
      },
      {
        header: '分公司簡稱',
        field: 'Abbr',
        sortable: false,
      },
      {
        header: '內部代碼',
        field: 'InBhNo',
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
   * 在組件初始化時執行查詢，以獲取分公司數據。
   * 該方法從 branchDataManagementService 獲取數據，
   * 將返回的數據映射成包含序號的數組，並賦值給 tableData。
   */
  doQuery(): void {
    const params = {
      ...this.queryForm.value,
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.setDefaultParams(params);
    // console.log(params);
    this.loadingMaskService.show();
    this.branchDataManagementService.getBranchDataManagement(params).subscribe({
      next: (response) => {
        this.queryTime = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
        });
        this.loadingMaskService.hide();
        if (response) {
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

  // 清除表單並重置
  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
    this.queryForm.patchValue(this.getUserInfoDefaultParams());
    this.tableData = []; // 清空查詢資料
    this.isSortable();
  }

  /**
   * 設置動態下拉選單的 Options 資料
   */
  setOptions(): void {
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (options) => {
        this.options = options;
        // 將選項資料轉換為字符串並記錄日誌
        // console.log('setOptions data = ' + JSON.stringify(this.options));
      },
    });
  }

  // 設置表格列是否可排序的方法
  isSortable(): void {
    const isSort = this.tableData.length > 1;
    this.tableColumns.map((column) => (column.sortable = isSort));
    if (this.branchTable) {
      this.branchTable.reset();
    }
  }
}
