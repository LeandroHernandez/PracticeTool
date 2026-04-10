import { DateTime } from "luxon"

interface IEnEs {
    en: string,
    es: string,
}

export interface IPlan {
    id: string,
    title: IEnEs,
    description: IEnEs,
    price: number
    features: IEnEs[]
    createdAt: DateTime | string;
    lastUpdate: DateTime | string;
    state: boolean;
}

export interface IPlanBody extends Omit<IPlan, 'id' | 'assignedModules'> {
    assignedModules?: string[],
}

export type TPlanChangeState = Pick<IPlan, 'id' | 'state'>;
