import { Routes } from '@angular/router';
import { RoutesApp } from '../../../../enums';

export const elementsToPracticeRoutes: Routes = [
  {
    path: RoutesApp.root,
    loadComponent: () =>
      import('./elements-to-practice-content').then(
        (m) => m.ElementsToPracticeContentComponent
      ),
  },
  {
    path: RoutesApp.add,
    loadComponent: () =>
      import('./add-element-to-practice').then(
        (m) => m.AddElementToPracticeComponent
      ),
  },
  {
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
