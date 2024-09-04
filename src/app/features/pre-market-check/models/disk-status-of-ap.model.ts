// 資料結構
export interface DiskStatusOfApResponse {
  DBIp: string;
  DBName: string;
  IP_list: IPList[];
}

export interface IPList {
  IP: string;
  AP_list: APList[];
}

export interface APList {
  AppName: string;
  AppPath: string;
  ProcessStatus: string;
  ModDate: string;
  ModTime: string;
}

// 轉換後的資料結構
export interface DiskStatusOfAPTableData {
  DBIp: string;
  DBName: string;
  AppName: string;
  AppPath: string;
  ProcessStatus: string;
  ModDate: string;
  ModTime: string;
}
