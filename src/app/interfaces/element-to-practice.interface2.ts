import { IType } from './type.interface';

export interface IVerbInfo {
  // simplePresent?: string;
  simplePast?: string;
  pastParticiple?: string;
  irregular?: boolean;
  // wordType: IType;
}

export interface IUse {
  id: string;
  name: string;
  meanings: Array<string>;
  verbInfo?: IVerbInfo;
}

export interface IElementToPractice2 {
  id?: string;
  // type: 'Verb' | 'Adjective' | 'Noun' | 'Preposition' | 'Adverb' ;
  type: IType | string;
  en: string;
  selectedUses?: Array<IType>;
  uses?: Array<IUse>;
  meanings?: Array<string>;
  // es: Array<IMeaning>;
}
