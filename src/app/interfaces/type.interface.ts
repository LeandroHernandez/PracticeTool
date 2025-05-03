
export interface IType {
    id?: string;
    name: string;
    father?: string | IType;
}
