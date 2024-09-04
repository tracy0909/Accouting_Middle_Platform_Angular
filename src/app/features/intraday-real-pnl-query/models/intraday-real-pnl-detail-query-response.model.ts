export interface IntradayRealPnlDetailQueryResponse {
  cntd_profit_details: CntdProfitDetail[];
}

export interface CntdProfitDetail {
  tdate: string;
  stock: string;
  stockname: string;
  dseq: string;
  qty: number;
  cqty: number;
  price: number;
  amt: number;
  bcost: number;
  fee: number;
  tax: number;
  ttype: number;
  ttypename: string;
  currency: string;
  currnm: string;
}
