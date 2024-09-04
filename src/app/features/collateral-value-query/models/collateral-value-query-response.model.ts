export interface CollateralValueQueryResponse {
  creditdn_sum: CreditdnSum;
  lenddn_sum: LenddnSum;
}

// export interface UnrealSum {
//   no: string;
//   ttype: string;
//   ttypename: string;
//   stock: string;
//   stockname: string;
//   real_qty: string;
//   qty: string;
//   bqty: string;
//   sqty: string;
//   cost: string;
//   avgprice: string;
//   nowamt: string;
//   unreal: string;
//   urratio: string;
//   lastprice: string;
//   interest: string;
//   divamt: string;
//   AD: string;
//   ADR: string;
//   currency: string;
//   currnm: string;
// }

export interface CreditdnSum {
  no: string;
  stock: string;
  stocknm: string;
  qty: string;
  lastprice: string;
  nowamt: string;
  currency: string;
  currnm: string;
}

export interface LenddnSum {
  no: string;
  stock: string;
  stocknm: string;
  qty: string;
  lastprice: string;
  nowamt: string;
  currency: string;
  currnm: string;
}