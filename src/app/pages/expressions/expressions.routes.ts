import { Routes } from '@angular/router';
import { RoutesApp } from '../../constants';

export const expressionRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./expressions.component').then(m => m.ExpressionsComponent),
    },
    {
        path: RoutesApp.addExpression,
        loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
    },
    {
        path: `${RoutesApp.addExpression}/:id`,
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
