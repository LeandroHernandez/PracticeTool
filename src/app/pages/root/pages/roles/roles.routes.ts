import { Routes } from '@angular/router';
import { RoutesApp } from '../../../../enums';

export const rolesRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./roles.component').then(m => m.RolesComponent),
    },
    {
        path: RoutesApp.add,
        loadComponent: () => import('./add-role/add-role.component').then(m => m.AddRoleComponent),
    },
    {
        path: `${RoutesApp.add}/:id`,
        loadComponent: () => import('./add-role/add-role.component').then(m => m.AddRoleComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
