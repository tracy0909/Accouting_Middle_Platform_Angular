import { RealPnlQueryDetailResponse } from './real-pnl-query-detail-response.model';

export interface RealPnlQueryResponse {
  root?: Root[];
  profit_sums?: ProfitSums[];
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

export interface ProfitSums {
  no: string;
  tdate: string;
  ttype: string;
  ttypename: string;
  stock: string;
  stocknm: string;
  cqty: string;
  price: string;
  bcost: string;
  scost: string;
  profit: string;
  prratio: string;
  currnm: string;
  seqno: string;
  dseq: string;
  uuid: string;
  currency: string;
  detailData: RealPnlQueryDetailResponse[];
}
