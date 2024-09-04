export interface IntradayRealPnlQueryResponse {
  root?: Root;
  cntd_profit_sums?: CntdProfitSum;
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

export interface CntdProfitSum {
  no: string;
  tdate: string;
  dseq: string;
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
  currency: string;
  currnm: string;
  uuid: number;
}
