import { Timestamp } from 'firebase/firestore/lite';
import { ControlTypes } from '../enums';
import { IRole } from './role.interface';

interface IMonthlyObjective {
  etps: number;
  lists: number;
}

export interface IUser {
  id: string;
  email: string;
  names: string;
  age: Timestamp;
  gender: string;
  lastnames: string;
  password: string;
  role?: IRole;
  createdAt: Date;
  lastUpdate: Date;
  state: boolean;
  monthlyObjective?: IMonthlyObjective;
}

type TUser = Omit<IUser, 'id' | 'role'>;

export interface IUserB extends TUser {
  role: string;
}

export type TUserChangeState = Pick<IUser, 'id' | 'state'>;

export interface IUFControl {
  name: string;
  title: string;
  type: ControlTypes;
  invalid?: string;
  options?: { label: string; value: string }[];
  controls?: IUFControl[];
}
