import { IRole } from "./role.interface";

export interface IUser {
    id?: string,
    email: string,
    names: string,
    lastnames: string,
    password: string,
    role?: IRole | string,
    createdAt: Date,
    lastUpdate: Date,
    state: boolean
}
