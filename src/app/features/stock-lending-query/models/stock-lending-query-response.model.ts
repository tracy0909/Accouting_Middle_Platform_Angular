export interface StockLendingQueryResponse {
  // sid: string;
  // sip: string;
  // Invscode: string;
  // comp: string;
  // bhno: string;
  // cseq: string;
  // lend_sums: LendSum[];
  // errcode: string;
  // msg: string;
  lend_sum: LendSum;
  // lend_detail: LendDetail;

}

export interface LendSum {
  no: string;
  stock: string;
  stocknm: string;
  qty: string;
  income: string;
  lend_details: { lend_detail: any };
}

export interface LendDetail {
  no: string;
  ldate: string;
  seqno: string;
  cdate: string;
  type: string;
  qty: string;
  bqty: string;
  income: string;
  dbfee: string;
  sfee: string;
  ndate: string;
  rate: string;
  stock: string;
  stocknm: string;
}