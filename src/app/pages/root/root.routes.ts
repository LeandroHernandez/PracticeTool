import { Routes } from "@angular/router";
import { RoutesApp } from "../../enums";

export const rootRoutes: Routes = [
    {
        path: RoutesApp.profile,
        loadComponent: () => import('./pages/profile').then(m => m.ProfileComponent),
    },
    {
        path: RoutesApp.dashboard,
        loadComponent: () => import('./pages/dashboard').then(m => m.DashboardComponent),
    },
    {
        path: RoutesApp.roles,
        loadChildren: () => import('./pages/roles').then(m => m.rolesRoutes),
    },
    {
        path: RoutesApp.users,
        loadComponent: () => import('./pages/users').then(m => m.UsersComponent),
    },
    {
        path: RoutesApp.elementsToPractice,
        loadComponent: () => import('./pages/elements-to-practice').then(m => m.ElementsToPracticeComponent),
        loadChildren: () => import('./pages/elements-to-practice').then(m => m.elementsToPracticeRoutes),
    },
    {
        path: RoutesApp.practiceLists,
        loadChildren: () => import('./pages/practice-lists/practice-lists.routes').then(m => m.practiceListsRoutes),
    },
    {
        path: RoutesApp.test,
        loadComponent: () => import('./pages/test/test.component').then(m => m.TestComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.dashboard,
    }
];
