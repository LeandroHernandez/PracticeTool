
interface IEnEs {
    en: string,
    es: string,
}

export interface IModule {
    id: string,
    label: IEnEs,
    title: IEnEs,
    route: string,
    icon: string,
    description?: string,
    createdAt: Date | any,
    lastUpdate: Date | any,
    state: boolean,
};

export type TModule = Omit<IModule, 'id'>;

export type TModuleChangeState = Pick<IModule, 'id' | 'state'>;
