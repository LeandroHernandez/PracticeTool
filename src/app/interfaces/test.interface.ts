import { IElementToPractice } from "./element-to-practice.interface";
import { IUser } from "./user.interface";

export enum ETestReference {
    etps = 'etps',
    practiceLists = 'practiceLists',
}

export type TEtpTestItem = Pick<IElementToPractice, 'id' | 'en'>;

export interface IEtpTI extends TEtpTestItem {
    date: Date | string;
    number: number;
};

type TEnEs = {
    en: string;
    es: string;
}

type TPLReference = {
    id: string;
    title: TEnEs;
}

export type TListTestItem = Omit<IEtpTI, 'id' | 'en'>;
export interface IListTI extends TListTestItem {
    reference: TPLReference;
};

// export type TReviewedEL = Omit<IEtpTI, 'number'>

export interface ITest {
    id: string;
    author: string | IUser;
    etps: Array<TEtpTestItem>;
    mistakes: Array<IEtpTI>;
    correctOnes: Array<IEtpTI>;
    reference: ETestReference;
    practiceListReferences: Array<TPLReference>;
    createdAt: Date | any,
    lastUpdate: Date | any,
    completedPercentage: number;
    state: boolean;
}

export type TTestBody = Omit<ITest, 'id'>;


//
type TWeekDatasets = { data: number[], label?: string };
export type TWeek = {
    year: number,
    months: number[],
    weekNumber: number,
    labels: string[],
    datasets: TWeekDatasets[],
};