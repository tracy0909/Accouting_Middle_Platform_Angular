export interface SetStatusRequest {
  DBSource: string;
  ModuleId: string;
  Status: 'Y' | 'N';
  MenuId: string;
  ButtonType: string;
  OperatorId: string;
}
