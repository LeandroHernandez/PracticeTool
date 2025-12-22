
export enum filterFieldTypes {
    text = 'text',
    select = 'select',
    multiselect = 'multiselect',
}

export interface ITableItem {
    header: string,
    key: string,
    filter?: filterFieldTypes
}
