import { DivamtDetail } from './divamt-detail.model';

interface Details {
  detail: DivamtDetail | DivamtDetail[];
}
export interface Root {
  sid: string;
  sip: string;
  Invscode: string;
  comp: string;
  cseq: string;
  divcount: string;
  baseqty: string;
  divamt: string;
  details: Details;
  errcode: string;
  msg: string;
}
