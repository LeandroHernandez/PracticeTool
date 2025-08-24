import { Routes } from '@angular/router';
import { RoutesApp } from '../../constants';

export const authRoutes: Routes = [
  // {
  //   path: RoutesApp.root,
  //   loadComponent: () => import('./auth-content').then( (m) => m.AuthContentComponent ),
  // },
  {
    path: RoutesApp.logIn,
    loadComponent: () => import('./log-in').then( (m) => m.LogInComponent ),
  },
  {
    path: RoutesApp.signUp,
    loadComponent: () => import('./sign-up').then( (m) => m.SignUpComponent ),
  },
  {
    path: RoutesApp.other,
    redirectTo: RoutesApp.logIn,
  },
];
