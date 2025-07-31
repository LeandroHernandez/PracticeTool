
interface ISwitchInfo {
    checked: string;
    unChecked: string;
} 

export interface IFilterFormField {
    type: 'select' | 'multiselect' | 'switch' | 'text' | 'number' | 'subForm';
    label: string;
    key: string;
    intialValue?: any;
    placeholder?: string;
    switchInfo?: ISwitchInfo;
    subForm?: Array<IFilterFormField>;
    selectOptions?: Array<any>
}
