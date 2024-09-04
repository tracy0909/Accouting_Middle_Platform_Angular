interface HistStmtQueryResponse {
  sid: string;
  sip: string;
  Invscode: string;
  comp: string;
  bhno: string;
  cseq: string;
  income: number;
  cost: number;
  netamt: number;
  fee: number;
  tax: number;
  cdamt: number;
  creditsum: {
    crmarketvalue: number;
    dbmarketvalue: number;
    dnamt: number;
    crlimit: number;
    dblimit: number;
    gtamt: number;
    cramt: number;
    dbamt: number;
    accmrate: number;
    accmrate_y: number;
  };
  settlementinfo: {
    settlement_t: number;
    settlement_y: number;
    settlement_net: number;
  };
  profiles: {
    profile: {
      no: number;
      tdate: string;
      dseq: string;
      dno: string;
      stock: string;
      stocknm: string;
      wtype: string;
      ttype: string;
      etype: string;
      bstype: string;
      price: number;
      qty: number;
      amt: number;
      fee: number;
      tax: number;
      stintax: number;
      healthfee: number;
      rvint: number;
      netamt: number;
      dbfee: number;
      cramt: number;
      dnamt: number;
      crint: number;
      dnint: number;
      dlfee: number;
      bfint: number;
      obamt: number;
      intax: number;
      currency: string;
    }[];
  };
  errcode: string;
  msg: string;
}
