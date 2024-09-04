export interface DialogParams {
  DBSource: string;
  ModuleId: string;
  ModuleName: string;
  Level: number;
  ParentId: string;
  Url: string;
  Remark: string;
  Status: 'Y' | 'N';
  OrderSeq: number;
  ButtonList: string;
  MenuId: string;
  ButtonType: string;
  OperatorId: string;
}
