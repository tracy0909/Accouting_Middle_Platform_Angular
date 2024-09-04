import { offerDetail } from "./subscription-announcement-inquiry.model";

export interface offerDetailJson {
  root: root
}

interface offer_detail {
  offer_detail: offerDetail[]
}

interface root {
  sid: string;
  sip: string;
  Invscode: number;
  comp: string;
  bhno: string;
  offer_details: offer_detail;
  errorcode: number;
  msg: string;
}