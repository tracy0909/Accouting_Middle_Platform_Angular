// 資料結構
export interface DiskStatusOfServerResponse {
  DBIp: string;
  DBName: string;
  Computer_list: ComputerList[];
}

export interface ComputerList {
  IPAddress: string;
  HostName: string;
  Disk_list: DiskList[];
}

export interface DiskList {
  DiskName: string;
  DiskCapacity: string;
  DiskUsedSpace: string;
  DiskUsage: string;
  IsSecure: string;
  ModDate: string;
  ModTime: string;
}

// 轉換後的資料結構
export interface DiskStatusOfServerTableData {
  DBIp: string;
  DBName: string;
  IPAddress: string;
  HostName: string;
  DiskName: string;
  DiskCapacity: string;
  DiskUsedSpace: string;
  DiskUsage: string;
  IsSecure: string;
  ModDate: string;
  ModTime: string;
}
