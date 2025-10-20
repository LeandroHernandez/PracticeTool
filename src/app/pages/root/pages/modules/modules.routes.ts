import { Routes } from '@angular/router';
import { RoutesApp } from '../../../../enums';

export const modulesRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./modules.component').then(m => m.ModulesComponent),
    },
    {
        path: RoutesApp.add,
        loadComponent: () => import('./add-module').then(m => m.AddModuleComponent),
    },
    {
        path: `${RoutesApp.add}/:id`,
        loadComponent: () => import('./add-module').then(m => m.AddModuleComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
