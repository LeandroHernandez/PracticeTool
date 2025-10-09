import { Routes } from '@angular/router';
import { RoutesApp } from '../../enums';

export const authRoutes: Routes = [
  {
    path: `${RoutesApp.logIn}`,
    loadComponent: () => import('./log-in').then( (m) => m.LogInComponent ),
  },
  {
    path: `${RoutesApp.signUp}`,
    loadComponent: () => import('./sign-up').then( (m) => m.SignUpComponent ),
  },
  {
    path: RoutesApp.other,
    redirectTo: `${RoutesApp.logIn}`,
  },
];
