import { Routes } from '@angular/router';
import { RoutesApp } from '../../constants';

export const authRoutes: Routes = [
    // {
    //     path: RoutesApp.root,
    //     loadComponent: () => import('./auth.component').then(m => m.AuthComponent),
    // },
    {
        path: RoutesApp.logIn,
        loadComponent: () => import('./log-in/log-in.component').then(m => m.LogInComponent),
    },
    {
        path: RoutesApp.signUp,
        loadComponent: () => import('./sign-up/sign-up.component').then(m => m.SignUpComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.logIn,
    }
];
