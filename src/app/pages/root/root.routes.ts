import { Routes } from '@angular/router';
import { RoutesApp } from '../../enums';
import { canActivateUserAndState } from '../../guards/auth-and-state-guard';

export const rootRoutes: Routes = [
  {
    canActivate: [canActivateUserAndState],
    path: RoutesApp.profile,
    loadComponent: () =>
      import('./pages/profile').then((m) => m.ProfileComponent),
  },
  {
    canActivate: [canActivateUserAndState],
    path: RoutesApp.dashboard,
    loadComponent: () =>
      import('./pages/dashboard').then((m) => m.DashboardComponent),
  },
  {
    canActivate: [canActivateUserAndState],
    path: RoutesApp.modules,
    loadChildren: () => import('./pages/modules').then((m) => m.modulesRoutes),
  },
  {
    canActivate: [canActivateUserAndState],
    path: RoutesApp.roles,
    loadChildren: () => import('./pages/roles').then((m) => m.rolesRoutes),
  },
  {
    canActivate: [canActivateUserAndState],
    path: RoutesApp.users,
    loadChildren: () => import('./pages/users').then((m) => m.usersRoutes),
  },
  {
    canActivate: [canActivateUserAndState],
    path: RoutesApp.elementsToPractice,
    loadComponent: () =>
      import('./pages/elements-to-practice').then(
        (m) => m.ElementsToPracticeComponent
      ),
    loadChildren: () =>
      import('./pages/elements-to-practice').then(
        (m) => m.elementsToPracticeRoutes
      ),
  },
  {
    canActivate: [canActivateUserAndState],
    path: RoutesApp.practiceLists,
    loadChildren: () =>
      import('./pages/practice-lists/practice-lists.routes').then(
        (m) => m.practiceListsRoutes
      ),
  },
  {
    canActivate: [canActivateUserAndState],
    path: RoutesApp.test,
    loadComponent: () =>
      import('./pages/test/test.component').then((m) => m.TestComponent),
  },
  {
    path: RoutesApp.other,
    redirectTo: RoutesApp.dashboard,
  },
];
