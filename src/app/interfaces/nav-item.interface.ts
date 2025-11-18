
// export interface INavItem {
//     label: string;
//     title?: string;
//     icon: string;
//     route: string;
// }

import { IModule } from "./module.interface";

export type TNavItem = Pick<IModule, 'label' | 'title' | 'icon' | 'route'>;
