export interface IntradayTransferMonitorResponse {
  FCode: string;
  FDate: string;
  TrStatus: string;
  TrTime: string;
  TrDate: string;
  ReadCt: string;
  NewCt: string;
  OldCt: string;
  DeleteCt?: string;
  TrUser?: string;
  FolderPath?: string;
  Descript?: string;
}
