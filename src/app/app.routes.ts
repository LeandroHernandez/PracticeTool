import { Routes } from '@angular/router';
import { RoutesApp } from './enums';
// import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { canActivateAuthStateRole } from './guards/auth-state-role.guard';

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
        // ...canActivate(() => redirectUnauthorizedTo([RoutesApp.landingPage])),
        canActivate: [canActivateAuthStateRole],
        loadComponent: () => import('./pages/root').then(m => m.RootComponent),
        loadChildren: () => import('./pages/root').then(m => m.rootRoutes),
    },

    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
