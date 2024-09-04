/**
 * 單身 Table 的欄位定義
 */
export interface TableColumn {
  /**
   * 欄位名稱，設定的值是要透過 translateService instant 後的文字。
   */
  header: string;

  /**
   * 欄位的屬性名稱，要取資料物件的那個值出來呈現。
   */
  field: string;

  /**
   * inline edit 的 FormControl 名稱。
   * 如果與 field 命名不同的時候才要設定。
   */
  inlineFormControlName?: string;

  /**
   * 是否為必填欄位。
   * inline edit 才有用，非 inline edit 的不需要看是否必填。
   * 這個只會在欄位上面加上紅色星號，實際上欄位的必填驗證要寫在 formGroup 上。
   */
  required?: boolean;

  /**
   * 用在 inline edit 上，指定編輯元件的 Template 名稱
   */
  templateOutlet?: any

  /**
   * 欄位的值要根據多語系切換的話，欄位的屬性名稱。( 前提是這個資料回傳也要有多國語系 )
   */
  translateDataValueField?: string;

  /**
   * 下拉選單的欄位要設定這個。
   */
  translateArrayValue?: {
    /**
     * 下拉選單的 Options 資料 Array
     */
    datas: any[],
    /**
     * 資料比對的欄位名稱
     */
    valueField: string,

    /**
     * 要顯示在畫面上的欄位名稱
     */
    displayField: string
  };

  /**
   * 是否為數字欄位 ( 數字欄位會加上千分位符號 )
   */
  numberField?: boolean;

  /**
   * 數字欄位為空的時候顯示為 0。
   * 預設數值為空的狀態不會顯示 0，如果希望顯示 0 要特別設定。
   *
   */
  numberFieldDefaultZero?: boolean;

  /**
   * 是否為日期欄位 ( 日期欄位要資料是 Date 才會格式化 )
   */
  dateField?: boolean;

  /**
   * 日期轉換格式。
   * dateField = true，才會生效。
   * 預設是 yyyy/MM/dd。
   */
  dateFormat?: string;

  /**
   * 欄位寬度 (px)，設定數字就可以
   */
  width?: number;

  /**
   * 是否可排序
   */
  sortable?: boolean;

  /**
   * 篩選的欄位
   */
  filter?: {

    type: string,

    matchMode?: string

    field?: string,

    options?: any[],

    translateOptionFieldName?: boolean
  }

  /**
   * 是否為自行控制欄位。
   * 如果有需要自己根據條件判斷，變更顯示的內容，可以用這個類型。
   * 例如：檔案下載連結
   */
  customField?: boolean;

  /**
   * 超過寬度是否要換行顯示。
   * 預設是隱藏，如果要換行顯示要改 true
   */
  overflowBreak?: boolean;
}
