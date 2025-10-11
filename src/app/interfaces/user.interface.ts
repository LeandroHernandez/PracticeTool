import { ControlTypes } from '../enums';
import { IRole } from './role.interface';

export interface IUser {
  id: string;
  email: string;
  names: string;
  lastnames: string;
  password: string;
  role?: IRole;
  createdAt: Date;
  lastUpdate: Date;
  state: boolean;
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
  invalid: string;
}
