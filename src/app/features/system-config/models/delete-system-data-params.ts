export interface DeleteSystemDataParams {
    DBSource: string;
    VN_List: Array<{
        VarName: string;
        Number: number;
    }>;
    MenuId: string;
    ButtonType: string;
    OperatorId: string;
}
