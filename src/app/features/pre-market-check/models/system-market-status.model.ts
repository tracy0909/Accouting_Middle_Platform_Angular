// 資料結構
export interface SystemMarketStatusResponse {
  DBIp: string;
  DBName: string;
  MARKET_list: MarketList[];
}

export interface MarketList {
  InvtCode: string;
  CName: string;
  TDate: string;
  StartTime: string;
  EndTime: string;
}

// 轉換後的資料結構
export interface SystemMarketStatusTableData {
  DBName: string;
  InvtCode: string;
  CName: string;
  TDate: string;
  StartTime: string;
  EndTime: string;
}
