import { Routes } from '@angular/router';
import { RoleIds, RoutesApp } from '../../enums';
import { canActivateAuthStateRole } from '../../guards/auth-state-role.guard';
// import { canActivateWithRole } from '../../guards/auth-role.guard';
// import { canActivateRole } from '../../guards';

export const rootRoutes: Routes = [
  {
    canActivate: [canActivateAuthStateRole],
    path: RoutesApp.profile,
    loadComponent: () =>
      import('./pages/profile').then((m) => m.ProfileComponent),
  },
  {
    canActivate: [canActivateAuthStateRole],
    path: RoutesApp.dashboard,
    loadComponent: () =>
      import('./pages/dashboard').then((m) => m.DashboardComponent),
  },
  {
    canActivate: [canActivateAuthStateRole([RoleIds.admin])],
    path: RoutesApp.modules,
    loadChildren: () => import('./pages/modules').then((m) => m.modulesRoutes),
  },
  {
    canActivate: [canActivateAuthStateRole([RoleIds.admin])],
    path: RoutesApp.roles,
    loadChildren: () => import('./pages/roles').then((m) => m.rolesRoutes),
  },
  {
    canActivate: [canActivateAuthStateRole([RoleIds.admin])],
    path: RoutesApp.users,
    loadChildren: () => import('./pages/users').then((m) => m.usersRoutes),
  },
  {
    canActivate: [canActivateAuthStateRole],
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
    canActivate: [canActivateAuthStateRole],
    path: RoutesApp.practiceLists,
    loadChildren: () =>
      import('./pages/practice-lists/practice-lists.routes').then(
        (m) => m.practiceListsRoutes
      ),
  },
  {
    canActivate: [canActivateAuthStateRole],
    path: RoutesApp.test,
    loadComponent: () =>
      import('./pages/test/test.component').then((m) => m.TestComponent),
  },
  {
    path: RoutesApp.other,
    redirectTo: RoutesApp.dashboard,
  },
];
