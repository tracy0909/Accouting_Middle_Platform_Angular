export interface LoanTradeQueryResponse {
  // no: number;
  // stkdate: string;
  // stock: string;
  // stocknm: string;
  // begindate: string;
  // biddate: string;
  // winprice: string;
  // winqty: string;
  // gtamt: string;
  // bidfee: string;
  // balance: string;
  // winfee: string;
  // cost: string;
  // cflag: string;
  // sid: string;
  // sip: string;
  // Invscode: string;
  // comp: string;
  // bhno: string;
  // cseq: string;
  // profile_sums: ProfileSum[];
  // errcode: string;
  // msg: string;
  profile_sum: ProfileSum;
  profile_detail: ProfileDetail;
}

// export interface Root {
//   sid: string;
//   sip: string;
//   Invscode: string;
//   comp: string;
//   bhno: string;
//   cseq: string;
//   profile_sums: ProfileSum[];
//   errcode: string;
//   msg: string;
// }

interface ProfileSum {
  no: string;
  ttype?: string;
  ttypename?: string;
  stock?: string;
  stocknm?: string;
  qty: number;
  price?: number;
  mamt: number;
  fee: number;
  tax: number;
  netamt: number;
  currency?: string;
  currnm?: string;
  profile_details?: ProfileDetail[];
}

interface ProfileDetail {
  no: string;
  tdate: string;
  mtime?: string;
  dseq: string;
  qty: number;
  price: number;
  mamt: number;
  fee: number;
  tax: number;
  netamt: number;
  currency: string;
  currnm: string;
}
