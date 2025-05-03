import { Routes } from '@angular/router';
import { RoutesApp } from '../../constants';

export const idiomRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./idioms.component').then(m => m.IdiomsComponent),
    },
    {
        path: RoutesApp.addIdiom,
        loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
    },
    {
        path: `${RoutesApp.addIdiom}/:id`,
        loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
    },
    {
        path: RoutesApp.test,
        loadComponent: () => import('../test/test.component').then(m => m.TestComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
