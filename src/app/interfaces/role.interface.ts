
export interface IRole {
    id: string,
    name: string,
    description?: string,
    createdAt: Date | any,
    lastUpdate: Date | any,
    state: boolean,
};

export type TRole = Omit<IRole, 'id'>;

export type TRoleChangeState = Pick<IRole, 'id' | 'state'>;
