import { Routes } from '@angular/router';
import { RoleIds, RoutesApp } from '../../../../enums';
import { subMenuGuard } from '../../../../guards/sub-menu.guard';

export const elementsToPracticeRoutes: Routes = [
  {
    path: RoutesApp.root,
    loadComponent: () =>
      import('./elements-to-practice-content').then(
        (m) => m.ElementsToPracticeContentComponent
      ),
  },
  {
    canActivate: [subMenuGuard([RoleIds.admin])],
    path: RoutesApp.add,
    loadComponent: () =>
      import('./add-element-to-practice').then(
        (m) => m.AddElementToPracticeComponent
      ),
  },
  {
    canActivate: [subMenuGuard([RoleIds.admin])],
    path: `${RoutesApp.add}/:id`,
    loadComponent: () =>
      import('./add-element-to-practice').then(
        (m) => m.AddElementToPracticeComponent
      ),
  },
  {
    path: RoutesApp.test,
    loadComponent: () =>
      import('../test/test.component').then((m) => m.TestComponent),
  },
  {
    path: RoutesApp.other,
    redirectTo: RoutesApp.root,
  },
];
