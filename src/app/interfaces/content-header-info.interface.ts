interface IOption {
    label: string;
    title: string;
    route: string;
    disabled?: boolean;
  }
  
export interface IContentHeaderInfoItem {
    add: IOption;
    title: string;
    test: IOption;
  }