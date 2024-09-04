export interface ComprehensivePnlQueryRequest {
    APISERVER: string;
    sid: string;
    sip: string;
    Invscode: string;
    comp: string;
    cseq: string;
    bhno: string;
    ttype: string;
    ctype: string;
    action: string;
    stock: string;
    stocknm: string;
    excludeTax: string;
    excludeExDividend: string;
}