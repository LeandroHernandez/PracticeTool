import { IType } from "./type.interface";

interface IVerbInfo {
    simplePresent?: string;
    simplePast?: string;
    pastParticiple?: string;
    irregular?: boolean;
    // wordType: IType;
}

// interface IMeaning {
//     value: string
// }

export interface IElementToPractice {
    id?: string;
    // type: 'Verb' | 'Adjective' | 'Noun' | 'Preposition' | 'Adverb' ;
    type: IType;
    en: string;
    verbInfo?: IVerbInfo;
    wordType?: IType;
    // es: Array<IMeaning>;
    es: Array<string>;
    // irregular?: boolean;
}
