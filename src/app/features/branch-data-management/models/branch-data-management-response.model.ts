export interface BranchDataManagementResponse {
  BhNo: string;       // 分公司代碼
  BhName: string;     // 分公司名稱
  Abbr: string;       // 分公司簡碼
  InBhNo: string;     // 內部分公司代碼
  ModDate: string;    // 更新日期
  ModTime: string;    // 更新時間
  ModUser: string;    // 更新人員
  AdjFlag?: string;   // 調整旗標
  GBhNo?: string;     // GBhNo
  SettFlag?: string;  // SettFlag
}
