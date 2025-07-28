interface IOption {
    label: string;
    title: string;
    route?: string;
    practiceList?: boolean;
  }
  
export interface IContentHeaderInfoItem {
    add: IOption;
    title: string;
    test: IOption;
  }