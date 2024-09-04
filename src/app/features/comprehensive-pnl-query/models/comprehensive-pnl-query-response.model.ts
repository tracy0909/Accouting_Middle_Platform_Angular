export interface ComprehensivePnlQueryResponse {
    root?: Root;
    unoffset_yests?: UnoffsetYest[];
    unoffset_tdyadds?: UnoffsetTdyadd[];
    offset_cdtds?: OffsetCdtd[];
    offset_tdys?: OffsetTdy[];
}

export interface Root {
    sid: string;
    sip: string;
    Invscode: string;
    comp: string;
    bhno: string;
    cseq: string;
    cntdflag: string;
    cntddesc: string;
    settle_status: string;
}

export interface UnoffsetYest {
    ttype: string;
    ttypename: string;
    stock: string;
    stocknm: string;
    qty: number;
    cost: number;
    avgprice: number;
    bcramt: number;
    mprice: number;
    bgtamt: number;
    namt: number;
    unreal: number;
    ur_ratio: string;
    currency: string;
    currnm: string;
}

export interface UnoffsetTdyadd {
    ttype: string;
    ttypename: string;
    stock: string;
    stocknm: string;
    real_qty: number;
    cost: number;
    avgprice: number;
    bcramt: number;
    mprice: number;
    bgtamt: number;
    namt: number;
    unreal: number;
    ur_ratio: string;
    currency: string;
    currnm: string;
}

export interface OffsetCdtd {
    stock: string;
    stocknm: string;
    cqty: number;
    bprice: number;
    sprice: number;
    profit: number;
    ttype: string;
    cramt: string;
    lastprice: number;
    gtamt: string;
    nowamt: string;
    currency: string;
    currnm: string;
}

export interface OffsetTdy {
    ttype: string;
    ttypename: string;
    stock: string;
    stocknm: string;
    cqty: number;
    avgprice: number;
    cost: number;
    income: number;
    profit: number;
    ur_ratio: string;
    lastprice: number;
    gtamt: string;
    nowamt: string;
    currency: string;
    currnm: string;
}