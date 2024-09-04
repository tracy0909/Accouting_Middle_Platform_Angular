import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, finalize, switchMap } from 'rxjs';
import { BaseComponent } from 'src/app/base/components/abstract/base.component';
import { ButtonList } from 'src/app/core/models/button-list.model';
import { Option } from 'src/app/shared/models/option.model';
import { holidaySettingReq } from '../models/holiday-setting.model';
import { holidaySettingResponse } from '../models/holiday-setting.response.model';
import { HolidaySettingService } from '../services/holiday-setting.service';
import { AuthButtonEnum } from 'src/app/core/enum/auth-button.enum';

@Component({
  selector: 'app-holiday-setting', // 設定元件的選擇器名稱
  templateUrl: './holiday-setting.component.html', // 指定元件的 HTML 模板
  styleUrls: ['./holiday-setting.component.scss'],
  providers: [HolidaySettingService], // 在 providers 陣列中提供 HolidaySettingService
})
export class HolidaySettingComponent extends BaseComponent {
  queryTime: string | null = null; // 資料查詢時間
  buttonList!: ButtonList;
  // 日曆元件引用
  @ViewChild('calendar', { static: false }) calendar: any;
  calendarContainer!: ElementRef;
  years: { year: number }[] = [];
  // 選擇的年份
  selectedYear: number = new Date().getFullYear(); // 直接初始化為當年份
  // 交易日渲染月份
  monthStartDates!: Date[];
  // 交易日選擇到的日期存在這
  selectedDates: { [key: string]: Date[] } = {};
  // 交割日選擇到的日期存在這
  deliveryselectedDates: { [key: string]: Date[] } = {};
  // 資料庫選項
  dbSourcesOptions: Option[] = []; // 動態下拉選單的 Options 資料
  readonly titleName = '放假日設定';

  // 使用 FormGroup
  holidayForm: FormGroup;
  activeIndex: number = 0; // 目前頁籤
  showPanel: boolean = true;

  // 初始狀態
  private initialState: {
    // 選擇年份
    selectedYear: number;
    // 選擇資料庫
    selectedDBSource: string;
    // 頁籤初始狀態
    activeIndex: number;
  };

  constructor(private holidaySettingService: HolidaySettingService) {
    super();
    // 新增：初始化 initialState
    this.initialState = {
      selectedYear: new Date().getFullYear(),
      selectedDBSource: '',
      activeIndex: 0,
    };
    this.holidayForm = this.formBuilder.group({
      DBSource: [''], // 預設值
      year: [this.initialState.selectedYear], // 預設為當前年份
    });
  }

  // 初始化
  ngOnInit(): void {
    // 初始化年份
    this.initializeYears();
    // 初始化日曆
    this.initializeCalendars();
    // 初始化時獲取放假日數據
    this.setOptions();
    this.buttonList = this.authButtonList;
    if (this.holidayForm.contains('DBSource')) {
      this.holidayForm.patchValue(this.getUserInfoDefaultParams());
    }
  }

  // 設置動態下拉選單的 Options 資料
  private setOptions(): void {
    // this.optionService
    //   .systemConfigDbSourceOptions()
    //   .pipe(
    //     switchMap((options) => {
    //       this.initialState.selectedDBSource = options[0].value;
    //       this.dbSourcesOptions = options;
    //       this.holidayForm
    //         .get('dbSource')
    //         ?.setValue(this.dbSourcesOptions[0].value);
    //       return this.queryInitSub(this.dbSourcesOptions[0].value);
    //     }),
    //     finalize(() => {
    //       this.loadingMaskService.hide();
    //       this.scrollToTop();
    //     }),
    //   )
    //   .subscribe({
    //     next: (value) => {
    //       this.setQueryValue(value);
    //     },
    //   });
    this.optionService.systemConfigDbSourceOptions().subscribe({
      next: (options) => {
        this.dbSourcesOptions = options;
        // 將選項資料轉換為字符串並記錄日誌
        console.log(
          'setOptions data = ' + JSON.stringify(this.dbSourcesOptions),
        );
      },
    });
  }

  private queryInitSub(DBSource: string): Observable<holidaySettingResponse[]> {
    this.loadingMaskService.show();
    const params: holidaySettingReq = {
      // 默認選 DB1
      DBSource: DBSource,
      country: 'TWN',
      invtCode: 'TWSE',
      // 確保年份是字串類型
      year: this.selectedYear.toString(),
      type: this.activeIndex.toString(),
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    // 調用 service 取得假日數據
    return this.holidaySettingService.getHolidays(params);
  }

  // 處理查詢結果的方法
  private setQueryValue(value: holidaySettingResponse[]): void {
    this.selectedDates = {};
    this.deliveryselectedDates = {};
    // 檢查是不是陣列
    if (Array.isArray(value)) {
      // 如果是陣列，則處理假日數據
      const changeData = this.processHolidayData(value);
      // 根據現在的頁籤設置相應的日期
      this.activeIndex === 0
        ? (this.selectedDates = changeData)
        : (this.deliveryselectedDates = changeData);
    }
  }

  // 初始化日曆，生成選中年份的每個月起始日期
  initializeCalendars(): void {
    this.monthStartDates = this.generateMonthStartDates(this.selectedYear);
  }

  // 切換是要看交易日還是交割日
  onTabChange(event: any) {
    // TabView 的索引從 0 開始，0 表示交易放假日，1 表示交割放假日
    this.activeIndex = event.index; //更新 activeIndex
    this.getHolidays();
  }

  // 初始化年份
  initializeYears() {
    // 抓當年的年份
    const currentYear = this.selectedYear;
    this.years = [];
    // 跑出前兩年與後兩年的年份
    for (let i = -2; i <= 2; i++) {
      this.years.push({ year: currentYear + i });
    }
  }

  // 產生每個月份邏輯
  generateMonthStartDates(year: number): Date[] {
    const dates: Date[] = [];
    for (let month = 0; month < 12; month++) {
      dates.push(new Date(year, month, 1));
    }
    return dates;
  }

  // 初始化選擇的交易月份畫面與交割月份的畫面
  initializeSelectedDates() {
    // 取得交易日期畫面
    this.monthStartDates.forEach((date, index) => {
      this.selectedDates[index.toString()] = this.generateMonthDates(
        date.getFullYear(),
        date.getMonth(),
      );
    });
    // 交割日期畫面
    this.monthStartDates.forEach((date, index) => {
      this.deliveryselectedDates[index.toString()] = this.generateMonthDates(
        date.getFullYear(),
        date.getMonth(),
      );
    });
  }

  // 設定每一個年份每個月的放假日
  generateMonthDates(year: number, month: number): Date[] {
    // 建立空陣列存放結果
    const dates: Date[] = [];
    // 計算一個月有幾天
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // 從1號到這個月最後一天跑迴圈
    for (let day = 1; day <= daysInMonth; day++) {
      // 建立一個日期物件
      const date = new Date(year, month, day);
      // 得到這天是星期幾
      const dayOfWeek = date.getDay();
      // 如果是周日就存1，周六就存6
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // 推到空陣列中存起來
        dates.push(date);
      }
    }
    // 返回所有放假的日期
    return dates;
  }

  // 新的取得放假日方法
  getHolidays() {
    this.loadingMaskService.show();
    const params: holidaySettingReq = {
      // 默認選 DB1
      DBSource: this.holidayForm.get('DBSource')?.value,
      country: 'TWN',
      invtCode: 'TWSE',
      // 確保年份是字串類型
      year: this.selectedYear.toString(),
      type: this.activeIndex.toString(),
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.QUERY,
      OperatorId: this.userAccount,
    };
    this.setDefaultParams(params);
    this.showPanel = false;
    // 調用 service 取得假日數據
    // console.log(params);
    this.holidaySettingService
      .getHolidays(params)
      .pipe(
        finalize(() => {
          this.loadingMaskService.hide();
          this.scrollToTop();
        }),
      )
      .subscribe({
        next: (data) => {
          this.queryTime = new Date().toLocaleTimeString('zh-TW', {
            hour12: false,
          });
          this.selectedDates = {};
          this.deliveryselectedDates = {};
          if (data.length === 0) {
            this.systemConfirmationService.confirmYear(() => {
              // 如果是陣列，則處理假日數據
              const changeData = this.processHolidayData(data);
              console.log(this.activeIndex);
              this.activeIndex === 0
                ? (this.selectedDates = changeData)
                : (this.deliveryselectedDates = changeData);
              this.onChangeYear();
              this.showPanel = true;
              this.scrollToTop();
            });
            return;
          }
          this.showPanel = true;
          const changeData = this.processHolidayData(data);
          console.log(this.activeIndex);
          this.activeIndex === 0
            ? (this.selectedDates = changeData)
            : (this.deliveryselectedDates = changeData);
        },
      });
  }

  // 處理假日的方法
  processHolidayData(data: holidaySettingResponse[]): {
    [key: number]: Date[];
  } {
    let result: { [key: number]: Date[] } = {};
    let selectedYear = parseInt(this.selectedYear.toString(), 10);

    data.forEach((month) => {
      if (month && typeof month.CMonth === 'string') {
        const monthIndex = parseInt(month.CMonth, 10) - 1;
        let holidayDates: Date[] = [];

        // 檢查是否存在 CDays 或 Settle
        const daysString = month.CDays || month.Settle;

        if (typeof daysString === 'string') {
          for (let day = 0; day < daysString.length; day++) {
            if (daysString[day] === '1') {
              holidayDates.push(new Date(selectedYear, monthIndex, day + 1));
            }
          }
          result[monthIndex] = holidayDates;
        } else {
          this.systemMessageService.error('資料錯誤');
        }
      } else {
        this.systemMessageService.error('資料錯誤');
      }
    });
    return result;
  }

  // 當搜尋按鈕被點擊時觸發
  onSearch(): void {
    const { year } = this.holidayForm.value;
    if (year !== this.selectedYear) {
      this.selectedYear = year;
      this.initializeCalendars();
    }

    // 取得新的假日設定
    this.getHolidays();

    // 搜尋後讓頁籤回到交易放假日設定
    this.activeIndex = 0;
  }

  // 新增 onReset 方法
  onReset() {
    this.showPanel = true;
    // 重置表單到初始狀態
    this.holidayForm.reset();
    this.holidayForm.get('year')?.setValue(this.initialState.selectedYear);
    // this.holidayForm
    //   .get('DBSource')
    //   ?.setValue(this.initialState.selectedDBSource);
    this.holidayForm.patchValue(this.getUserInfoDefaultParams());
    this.selectedYear = this.initialState.selectedYear;

    this.activeIndex = this.initialState.activeIndex;

    // 重新初始化日曆
    this.initializeCalendars();

    // 重新獲取假日數據
    this.getHolidays();
  }

  onChangeYear() {
    this.monthStartDates = this.generateMonthStartDates(this.selectedYear);
    this.initializeSelectedDates();
  }

  // 設定讓頁面可以滾動到頂部
  private scrollToTop(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  }

  // 儲存設定的放假日
  onSave() {
    // 準備要發送的數據
    const holidayData = this.prepareHolidayData();
    const params = {
      DBSource: this.holidayForm.get('DBSource')?.value,
      Country: 'TWN',
      InvtCode: 'TWSE',
      Type: this.activeIndex.toString(),
      CYear: this.selectedYear.toString(),
      MonthDays: this.formatMonthDays(holidayData, this.activeIndex.toString()),
      MenuId: this.menuId,
      ButtonType: AuthButtonEnum.UPDATE,
      OperatorId: this.userAccount,
    };

    this.holidaySettingService.putHolidays(params).subscribe({
      next: (response) => {
        this.systemMessageService.success('保存成功');
      },
    });
  }

  // 格式化月份天數的數據
  private formatMonthDays(holidayData: any[], type: string): string {
    return holidayData
      .map((month) => {
        const key = type === '0' ? 'CDays' : 'Settle';
        // 確保 CDays 或 Settle 的值是字符串，並且長度不超過 31
        const days = month[key].slice(0, 31);
        return `${month.CMonth}-${days}`;
      })
      .join(',');
  }

  // 要保存的假日數據
  private prepareHolidayData(): any[] {
    // 根據目前的活動頁籤選擇資料來源是交易日放假日還是交割放假日
    const data =
      this.activeIndex === 0 ? this.selectedDates : this.deliveryselectedDates;
    // 把每個月的數據跑迴圈
    return Object.keys(data).map((month) => {
      const monthIndex = parseInt(month);
      const daysInMonth = new Date(
        this.selectedYear,
        monthIndex + 1,
        0,
      ).getDate();
      let cDays = '0'.repeat(daysInMonth);

      // 選中的假日標記為1
      data[month].forEach((date) => {
        const dayIndex = date.getDate() - 1;
        cDays = cDays.slice(0, dayIndex) + '1' + cDays.slice(dayIndex + 1);
      });

      return {
        CMonth: (monthIndex + 1).toString().padStart(2, '0'),
        [this.activeIndex === 0 ? 'CDays' : 'Settle']: cDays,
      };
    });
  }
}
