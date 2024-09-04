import { SummaryDetail } from './summary-detail.model';

export interface Details {
  detail: SummaryDetail | SummaryDetail[];
}

export interface Root {
  sid: string;
  sip: string;
  Invscode: string;
  comp: string;
  bhno: string;
  cseq: string;
  accmrate: string;
  crlimit: string;
  dblimit: string;
  details: Details;
  errcode: string;
  msg: string;
}
