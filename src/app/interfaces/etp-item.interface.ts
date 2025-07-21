import { IElementToPractice2 } from './element-to-practice.interface2';

// export interface IEtpItem {
//   id: string;
//   etp: IElementToPractice2;
//   word: boolean;
//   aplications: boolean;
// }

export interface IEtp {
  id: string;
  etp: IElementToPractice2;
  word: boolean;
  aplications: boolean;
}

export interface IEtpItem {
  content: IEtp;
  index: number;
}

export interface IEtpToCheck {
  etpItem: IEtpItem;
  checkingWord: boolean;
  formValue: any;
}
