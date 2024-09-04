export interface BranchStatusQueryResponse {
  DBIp: string;
  DBName: string;
  BHNO_list: BhnoItem[];
}

export interface BhnoItem {
  Bhno: string;
  SettFlag: string;
  AdjFlag: string;
}
