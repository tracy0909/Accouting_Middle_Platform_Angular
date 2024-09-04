export interface QuoteServer {
  name: string;
  urlPath: string;
  target: string;
  data: QuoteQueryResponse[];
}

export interface QuoteQueryResponse {
  id: string;
  // endpoint: string;
  shortname: string;
  dealprice: string;
  refprice: string;
  moddate: string;
  modtime: string;
}
