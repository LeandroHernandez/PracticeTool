import { IVerbInfo } from './element-to-practice.interface2';

export interface IMistakenUse {
  name: string;
  meanings: Array<string>;
  verbInfo?: IVerbInfo;
}

export interface IMistake {
  property: string;
  input: Array<string | IMistakenUse | any> | string;
  right: Array<string | IMistakenUse | any> | string;
}
