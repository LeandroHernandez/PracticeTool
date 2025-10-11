import { IElementToPractice } from './element-to-practice.interface';

// export interface IEtpItem {
//   id: string;
//   etp: IElementToPractice;
//   word: boolean;
//   aplications: boolean;
// }

export interface IEtp {
  id: string;
  etp: IElementToPractice;
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
