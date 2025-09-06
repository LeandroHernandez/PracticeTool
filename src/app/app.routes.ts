import { Routes } from '@angular/router';
import { RoutesApp } from './constants';
import { authGuard } from './guards/auth.guard';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

export const routes: Routes = [
    {
        path: RoutesApp.landingPage,
        loadComponent: () => import('./pages/landing-page').then(m => m.LandingPageComponent),
    },
    {
        path: RoutesApp.auth,
        ...canActivate(() => redirectLoggedInTo([RoutesApp.dashboard])),
        loadComponent: () => import('./pages/auth').then(m => m.AuthComponent),
        loadChildren: () => import('./pages/auth').then(m => m.authRoutes),
    },

    {
        path: RoutesApp.root,
        // canActivateChild: [authGuard],
        ...canActivate(() => redirectUnauthorizedTo([RoutesApp.landingPage])),
        loadComponent: () => import('./pages/root').then(m => m.RootComponent),
        loadChildren: () => import('./pages/root').then(m => m.rootRoutes),
    },

    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
