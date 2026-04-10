import { Routes } from '@angular/router';
import { RoutesApp } from '../../../../enums';

export const plansRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./plans.component').then(m => m.PlansComponent),
    },
    {
        path: RoutesApp.add,
        loadComponent: () => import('./add-plan').then(m => m.AddPlanComponent),
    },
    {
        path: `${RoutesApp.add}/:id`,
        loadComponent: () => import('./add-plan').then(m => m.AddPlanComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
