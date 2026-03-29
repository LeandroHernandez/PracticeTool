import { IElementToPractice } from "./element-to-practice.interface";
import { IUser } from "./user.interface";

export enum ETestReference {
    etps = 'etps',
    practiceLists = 'practiceLists',
}

export type TEtpTestItem = Pick<IElementToPractice, 'id' | 'en'>;

export interface TEtpTI extends TEtpTestItem {
    number: number;
};

export interface ITest {
    id: string;
    author: string | IUser;
    etps: Array<TEtpTestItem>;
    mistakes: Array<TEtpTI>;
    correctOnes: Array<TEtpTI>;
    reference: ETestReference;
    createdAt: Date | any,
    lastUpdate: Date | any,
    completedPercentage: number;
    state: boolean;
}

export type TTestBody = Omit<ITest, 'id'>;
