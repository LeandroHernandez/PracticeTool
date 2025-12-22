import { IElementToPractice } from "./element-to-practice.interface";
import { IUser } from "./user.interface";

export enum ETestReference {
    etps = 'etps',
    practiceLists = 'practiceLists',
}

export interface ITest {
    id: string;
    author: string | IUser;
    etps: Array<IElementToPractice>;
    reference: ETestReference;
    createdAt: Date | any,
    lastUpdate: Date | any,
    state: boolean;
}

export type TTestBody = Omit<ITest, 'id'>;
