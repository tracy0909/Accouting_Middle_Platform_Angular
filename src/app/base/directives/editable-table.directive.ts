import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Output, Input } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { DomHandler } from 'primeng/dom';
import { EditableRow, Table } from 'primeng/table';
import { DataAction } from '../enum/data-action.enum';

/**
 * 用來擴充原本的 p-table inline edit 功能 ( 要寫在 p-table 上 )
 * 主要是用 PrimeNG 的 Row Edit 來增強
 */
@Directive({
  // selector: '[pBpaasEditableTable]',
  selector: 'p-table'
})
export class EditableTableDirective {

  constructor(private dt: Table) {}

  @Input() detailInViewStatus: boolean = true;

  /**
   * 進入 inline edit 開始編輯資料時，要呼叫這個實作把資料塞到 formGroup 內
   * @type {EventEmitter<any>} event.data: 要編輯的資料
   */
  @Output() onPatchEditableRow: EventEmitter<any> = new EventEmitter();

  /**
   * 按下儲存按鈕後，會呼叫這個，這裡面會把目前編輯中的資料作儲存
   */
  @Output() onSaveEditableRow: EventEmitter<Function> = new EventEmitter();

  /**
   * 按下刪除按鈕後，要呼叫這個實作從 detailDatas 移除該筆資料
   * @type {EventEmitter<any>} event.data: 要刪除的資料
   */
  @Output() onDeleteEditableRow: EventEmitter<any> = new EventEmitter();

  /**
   * 按下取消按鈕後，要做什麼額外的事
   * @type {EventEmitter<any>} event.data: 要取消的資料
   */
  @Output() onCancelEditableRow: EventEmitter<any> = new EventEmitter();

  /**
   * 通知 formGroup 變更 Submitted 狀態，供欄位驗證時判斷使用
   * @type {EventEmitter<any>} event: submitted true or false
   */
  @Output() inlineSubmitted: EventEmitter<any> = new EventEmitter();

  /**
   * 按下 Tab 鍵切換輸入欄位的事件
   * 這個主要會用在 table 欄位過多有分頁籤顯示的時候，要去判斷進入下一個頁籤的第一個欄位
   * @type {EventEmitter<any>} event.column: currentCell (TD)
   */
  @Output() onTab: EventEmitter<any> = new EventEmitter();

  /**
   * Focus 第一個錯誤的欄位的事件
   *
   * @type {EventEmitter<any>}
   */
  @Output() focusFirstInvalidField: EventEmitter<any> = new EventEmitter();

  /**
   * 結束 inline 編輯狀態
   */
  closeEditingRow(): void {
    // 清除 editingRowKeys
    const propNames = Object.getOwnPropertyNames(this.dt.editingRowKeys);
    const key = propNames[0];
    delete this.dt.editingRowKeys[key];
    // 結束編輯後要重新把分頁功能相關按鈕恢復能按
    this.enablePaginator();
  }

  /**
   * 開始 inline 編輯後，要把分頁功能相關按鈕變成不可按。
   * 因為在 inline edit 的時候再去切換分頁狀況會變得非常複雜，所以開始 inline edit 後，就不能改變分頁了。
   */
  disablePaginator(): void {
    // 找 p-table tag 裡面的 p-paginator 所有非 disabled 的 button 出來設定 disabled
    const paginatorPages = DomHandler.find(this.dt.el.nativeElement, 'p-paginator button:not(.p-disabled)');
    for (const button of paginatorPages) {
      DomHandler.addMultipleClasses(button, 'bpaas-editable-row-disabled p-disabled');
    }

    // 找 p-table tag 裡面的 p-paginator 所有 p-dropdown 出來設定 disabled，這個是每頁幾筆的下拉選單
    const paginatorPerPage = DomHandler.findSingle(this.dt.el.nativeElement, 'p-paginator p-dropdown');
    if (paginatorPerPage) {
      DomHandler.addMultipleClasses(paginatorPerPage, 'bpaas-editable-row-disabled p-disabled');
    }
  }

  /**
   * 結束 inline 編輯後，要重新把分頁功能相關按鈕恢復能按。
   */
  enablePaginator(): void {
    // 找 p-table tag 裡面的 p-paginator 所有因 inline 而 disabled 的物件出來取消 disabled
    const elements = DomHandler.find(this.dt.el.nativeElement, 'p-paginator .bpaas-editable-row-disabled.p-disabled');
    for (const element of elements) {
      DomHandler.removeClass(element, 'bpaas-editable-row-disabled');
      DomHandler.removeClass(element, 'p-disabled');
    }
  }
}

/**
 * 用來擴充原本的 p-table inline edit 功能 ( 要寫在明細資料的 td 上 )
 * 加這個才會有點下去進入該筆且該欄位的編輯狀態
 */
@Directive({
  selector: '[pBpaasEditableColumn]'
})
export class EditableColumnDirective implements AfterViewInit {

  constructor(private dt: Table,
    private editableTable: EditableTableDirective,
    private editableRow: EditableRow,
    private inlineFormGroup: FormGroupDirective,
    private el: ElementRef) {
  }

  ngAfterViewInit() {
    // 把欄位加上 p-editable-column，這個會用在之後判斷要跳到哪一個欄位使用
    DomHandler.addClass(this.el.nativeElement, 'p-editable-column');
  }

  /**
   * Table 現在是否在 inline edit 狀態
   * @returns
   */
  isTableInEdit(): boolean {
    return this.dt?.editingRowKeys && Object.keys(this.dt.editingRowKeys).length > 0;
  }

  /**
   * 滑鼠 click 按下的事件
   * @param event MouseEvent
   * @returns
   */
  @HostListener('click', ['$event'])
  onTdClick(event: MouseEvent): void {

    if (this.editableTable.detailInViewStatus) {
      return;
    }

    // console.log('EditableColumnDirective editableRow = ' + JSON.stringify(this.editableRow.data));
    // console.log('EditableColumnDirective editingRowKeys = ' + JSON.stringify(this.dt.editingRowKeys));
    // console.log('EditableColumnDirective inlineFormGroup = ' + JSON.stringify(this.inlineFormGroup.value));

    // 如果切換了不同筆才進去才判斷是否要進入編輯，第一次開始編輯也會觸發
    if (!this.isTableInEdit() || !this.dt.editingRowKeys[this.editableRow.data[this.dt.dataKey!]]) {

      // 如果已經在編輯狀態。要先驗證目前正在編輯的資料是否都已正確輸入，然後才能進入下一筆的編輯
      if (this.isTableInEdit()) {
        // 變更 formGroup Submitted 狀態 ( 使用的程式需要實作 )
        this.editableTable.inlineSubmitted.emit(true);

        // 如果目前已經有在編輯，要先做欄位驗證，沒有問題才能繼續
        if (!this.inlineFormGroup.valid) {
          this.editableTable.focusFirstInvalidField.emit();
          return;
        }

        // 如果 editableTable 資料有被修改過，要先儲存資料
        // console.log('EditableColumnDirective inlineFormGroup dirty = ' + this.inlineFormGroup.dirty);
        if (this.inlineFormGroup.dirty) {
          // 發出儲存的事件 ( 使用的程式需要實作 )
          // 發出後如果有錯誤，目前還不知道怎麼取得，所以還是會進入下一筆的編輯狀態，之後可能發生 Bug
          // this.editableTable.onSaveEditableRow.emit();

          this.editableTable.onSaveEditableRow.emit(() => {
            this.openEditingRow();
          });
        } else {
          this.openEditingRow();
        }
      } else {
        this.openEditingRow();
      }
    }
  }

  openEditingRow(): void {
    // 設定目前正在編輯的 row
    this.dt.editingRowKeys = { [this.editableRow.data[this.dt.dataKey!]]: true };

    // 重設 formGroup 狀態，這樣才能透過 dirty 判斷是否有修改過
    this.inlineFormGroup.reset();

    // 變更 formGroup Submitted 狀態 ( 使用的程式需要實作 )
    this.editableTable.inlineSubmitted.emit(false);

    // 呼叫自行定義的 onPatchValue function，把資料塞到 formGroup 內
    this.editableTable.onPatchEditableRow.emit({ data: this.editableRow.data });

    // 這個 setTimeout 很重要，要等待一下讓輸入欄位都長出來才能繼續
    setTimeout(() => {
      // 點到哪個欄位就要 focus 那個欄位
      let focusableElement = DomHandler.findSingle(this.el.nativeElement, 'input, textarea, select');
      // console.dir(focusableElement);
      if (focusableElement) {
        focusableElement.focus();
      }

      // 為了解決日期欄位 tab focus 會跳到日曆按鈕或 autoComplete 的下拉按鈕上
      const buttonElements = this.el.nativeElement.parentElement.querySelectorAll('button.p-datepicker-trigger, button.p-autocomplete-dropdown');
      buttonElements.forEach((element: HTMLElement) => {
        element.setAttribute('tabindex', '-1');
      });

      // 分頁功能相關按鈕不可按
      this.editableTable.disablePaginator();
    }, 50);
  }

  /**
   * ctrl + 向下箭頭 事件
   * 為了避免與下拉選單衝突，所以多加上 ctrl 組合鍵來跳下一筆資料
   *
   * @param event KeyboardEvent
   * @returns
   */
  @HostListener('keydown.control.arrowdown', ['$event'])
  onArrowDown(event: KeyboardEvent): void {
    console.log('EditableRowColumnDirective onArrowDown');

    if (this.editableTable.detailInViewStatus) {
      return;
    }

    event.preventDefault();
    let currentCell = this.findCell(event.target);
    if (currentCell) {
      // 下拉選單不可按 ctrl + 箭頭鍵換列
      const dropdowns = DomHandler.find(currentCell, 'p-dropdown');
      if (dropdowns.length > 0) {
        return;
      }

      // 如果這個 TD 裡面沒有非 disable 的輸入欄位，代表 focus 進入了隱藏的控制欄位，不可按 ctrl + 箭頭鍵換列
      let focusableElement = DomHandler.findSingle(currentCell, 'input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
      if (!focusableElement) {
        return;
      }

      let cellIndex = DomHandler.index(currentCell);
      // console.log('EditableColumnDirective onArrowDown cellIndex = ' + cellIndex);
      // 找下一筆資料的這個欄位
      let targetCell = this.findNextEditableColumnByIndex(currentCell, cellIndex);
      if (targetCell) {
        // 觸發目標欄位的 click 事件，會進入 onTdClick
        DomHandler.invokeElementMethod(targetCell, 'click');
      }
    }
  }

  /**
   * ctrl + 向上箭頭 事件
   * 為了避免與下拉選單衝突，所以多加上 ctrl 組合鍵來跳上一筆資料
   *
   * @param event KeyboardEvent
   * @returns
   */
  @HostListener('keydown.control.arrowup', ['$event'])
  onArrowUp(event: KeyboardEvent) {
    console.log('EditableColumnDirective onArrowUp');

    if (this.editableTable.detailInViewStatus) {
      return;
    }

    event.preventDefault();
    let currentCell = this.findCell(event.target);
    if (currentCell) {
      // 下拉選單不可按 ctrl + 箭頭鍵換列
      const dropdowns = DomHandler.find(currentCell, 'p-dropdown');
      if (dropdowns.length > 0) {
        return;
      }

      // 如果這個 TD 裡面沒有非 disable 的輸入欄位，代表 focus 進入了隱藏的控制欄位，不可按 ctrl + 箭頭鍵換列
      let focusableElement = DomHandler.findSingle(currentCell, 'input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
      if (!focusableElement) {
        return;
      }

      let cellIndex = DomHandler.index(currentCell);
      // 找上一筆資料的這個欄位
      let targetCell = this.findPrevEditableColumnByIndex(currentCell, cellIndex);
      if (targetCell) {
        // 觸發目標欄位的 click 事件，會進入 onTdClick
        DomHandler.invokeElementMethod(targetCell, 'click');
      }
    }
  }

  /**
   * 透過目前輸入的元件找到是在 Table 的哪一個 TD
   * ( 命名有的叫 Cell 有的叫 Column 是按照 PrimeNG Table 程式的寫法 )
   *
   * @param element 目前輸入的元件
   * @returns 目前輸入的元件位於 Table 的哪一個 TD
   */
  findCell(element: any) {
    if (element) {
      let cell = element;
      // 一直往上找到有 p-editable-column class 的，就是這個元件在 Table 的 TD
      // ( 每個有標上 pBpaasEditableColumn 的 TD 會在 ngAfterViewInit 加上 p-editable-column class )
      while (cell && !DomHandler.hasClass(cell, 'p-editable-column')) {
        cell = cell.parentElement;
      }

      return cell;
    } else {
      return null;
    }
  }

  /**
   * 找到下一筆資料可以編輯的 TD
   *
   * @param cell 目前正在編輯的元件所在的 TD
   * @param index 要找的目標 TD index
   * @returns 下一筆資料可以編輯的 TD
   */
  findNextEditableColumnByIndex(cell: Element, index: number) {
    let nextRow = cell.parentElement?.nextElementSibling;
    if (nextRow) {
      let nextCell = nextRow.children[index];
      if (nextCell && DomHandler.hasClass(nextCell, 'p-editable-column')) {
          return nextCell;
      }
      return null;
    } else {
      return null;
    }
  }

  /**
   * 找到上一筆資料可以編輯的 TD
   *
   * @param cell 目前正在編輯的元件所在的 TD
   * @param index 要找的目標 TD index
   * @returns 上一筆資料可以編輯的 TD
   */
  findPrevEditableColumnByIndex(cell: Element, index: number) {
    let prevRow = cell.parentElement?.previousElementSibling;
    if (prevRow) {
      let prevCell = prevRow.children[index];
      if (prevCell && DomHandler.hasClass(prevCell, 'p-editable-column')) {
          return prevCell;
      }
      return null;
    } else {
      return null;
    }
  }

  /**
   * Tab 鍵事件
   * 做這個是會用在 table 欄位過多有分頁籤顯示的時候，要去判斷進入下一個頁籤的第一個欄位
   * 由使用到的程式自己實作判斷
   *
   * @param event KeyboardEvent
   */
  @HostListener('keydown.tab', ['$event'])
  onTab(event: KeyboardEvent) {
    if (this.editableTable.detailInViewStatus) {
      return;
    }
    event.preventDefault();
    let currentCell = this.findCell(event.target);
    this.editableTable.onTab.emit({ column: currentCell });
  }
}

/**
 * inline edit 儲存的按鈕
 */
@Directive({
  selector: '[pBpaasSaveEditableRow]'
})
export class SaveEditableRowDirective {

  constructor(
    private editableTable: EditableTableDirective,
    private inlineFormGroup: FormGroupDirective) {}

  /**
   * 按下儲存按鈕的事件
   *
   * @param event Event
   */
  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    // 變更 formGroup Submitted 狀態 ( 使用的程式需要實作 )
    this.editableTable.inlineSubmitted.emit(true);
    // 如果 formGroup 驗證有過才能繼續
    if (this.inlineFormGroup.valid) {
      // 把 formGroup 的資料取出來塞到 detailDatas 內 ( 使用的程式需要實作 )
      // this.editableTable.onSaveEditableRow.emit();
      // 把目前編輯的 Row 關閉
      // this.editableTable.closeEditingRow();

      this.editableTable.onSaveEditableRow.emit(() => {
        this.editableTable.closeEditingRow();
      });
    } else {
      this.editableTable.focusFirstInvalidField.emit();
    }
  }
}

/**
 * inline edit 取消的按鈕
 */
@Directive({
  selector: '[pBpaasCancelEditableRow]'
})
export class CancelEditableRowDirective {

  constructor(private dt: Table,
    private editableTable: EditableTableDirective,
    private inlineFormGroup: FormGroupDirective) {}

  /**
   * 按下取消按鈕的事件
   *
   * @param event Event
   */
  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    // 如果是新增的資料，編輯到一半按取消，要把他刪除
    if (this.inlineFormGroup.value['id'] === DataAction.NEW) {
      this.editableTable.onDeleteEditableRow.emit({
        // key: this.editableRow.data[this.dt.dataKey]
        data: this.inlineFormGroup.form.getRawValue(),
        confirm: false
      });
    } else {
      this.editableTable.onCancelEditableRow.emit();
    }
    // 把目前編輯的 Row 關閉
    this.editableTable.closeEditingRow();

    // 重設 formGroup 狀態，這樣才能透過 dirty 判斷是否有修改過
    this.inlineFormGroup.reset();

    // 變更 formGroup Submitted 狀態 ( 使用的程式需要實作 )
    this.editableTable.inlineSubmitted.emit(false);
  }
}

/**
 * inline edit 刪除的按鈕
 */
@Directive({
  selector: '[pBpaasDeleteEditableRow]'
})
export class DeleteEditableRowDirective {

  constructor(
    private dt: Table,
    private editableTable: EditableTableDirective,
    private editableRow: EditableRow,
    private inlineFormGroup: FormGroupDirective) {}

  /**
   * 按下刪除按鈕的事件
   *
   * @param event Event
   */
  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    this.editableTable.onDeleteEditableRow.emit({
      data: this.editableRow.data
    });
    this.editableTable.closeEditingRow();

    // 重設 formGroup 狀態，這樣才能透過 dirty 判斷是否有修改過
    this.inlineFormGroup.reset();

    // 變更 formGroup Submitted 狀態 ( 使用的程式需要實作 )
    this.editableTable.inlineSubmitted.emit(false);
  }
}
