import { Routes } from '@angular/router';
import { RoutesApp } from '../../../../enums';

export const usersRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./users.component').then(m => m.UsersComponent),
    },
    {
        path: RoutesApp.add,
        loadComponent: () => import('./add-user').then(m => m.AddUserComponent),
    },
    {
        path: `${RoutesApp.add}/:id`,
        loadComponent: () => import('./add-user').then(m => m.AddUserComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
