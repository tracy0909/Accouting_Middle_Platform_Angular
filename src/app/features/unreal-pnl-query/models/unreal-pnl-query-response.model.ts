import { UnrealPnlQueryDetailResponse } from './unreal-pnl-query-detail-response.model';

export interface UnrealPnlQueryResponse {
  root?: Root[];
  unreal_sums?: UnrealSums[];
}

export interface Root {
  sid: string;
  sip: string;
  Invscode: string;
  comp: string;
  bhno: string;
  cseq: string;
  settle_status: string;
}

export interface UnrealSums {
  no: string;
  ttypename: string;
  stock: string;
  stocknm: string;
  real_qty: string;
  qty: string;
  bqty: string;
  sqty: string;
  cost: string;
  avgprice: string;
  breakeven: string;
  breakevenfs: string;
  lastprice: string;
  AD: string;
  ADR: string;
  unreal: string;
  holdingpercent: string;
  urratio: string;
  bcramt: string;
  interest: string;
  bdnamt: string;
  bgtamt: string;
  currnm: string;
  nowamt: string;
  uuid: string;
  detailData: UnrealPnlQueryDetailResponse[];
}
