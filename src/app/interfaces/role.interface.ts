import { IModule } from "./module.interface";

export interface IRole {
    id: string,
    name: string,
    description?: string,
    assignedModules?: IModule[],
    createdAt: Date | any,
    lastUpdate: Date | any,
    state: boolean,
};

export interface IRoleBody extends Omit<IRole, 'id' | 'assignedModules'> {
    assignedModules?: string[],
}

// export type TRole = Omit<IRole, 'id'> extends { assignedModules: string[] } ? Omit<IRole, 'id'> : never;

export type TRoleChangeState = Pick<IRole, 'id' | 'state'>;
