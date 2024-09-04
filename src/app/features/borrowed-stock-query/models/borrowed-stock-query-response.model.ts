import { BorrowedDnamtQueryResponse } from './borrowed-dnamt-query-response.model';
import { BorrowedReplyQueryResponse } from './borrowed-reply-query-response.model';

export interface BorrowedStockQueryResponse {
  no: string;
  brdate: string;
  edate: string;
  stock: string;
  stocknm: string;
  dseq: string;
  rate: string;
  qty: string;
  bqty: string;
  dnamt: string;
  keeprate: string;
  dbfee: string;
  brfee: string;
  uuid: number;
  dnamtDetails: BorrowedDnamtQueryResponse[];
  replyDetails: BorrowedReplyQueryResponse[];
}
