export interface ProfileSum {
  no: string;
  ttypename: string;
  stock: string;
  stocknm: string;
  qty: string;
  price: string;
  mamt: string;
  fee: string;
  tax: string;
  netamt: string;
  currnm: string;
  profile_details: ProfileDetail;
}

export interface ProfileDetail {
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
