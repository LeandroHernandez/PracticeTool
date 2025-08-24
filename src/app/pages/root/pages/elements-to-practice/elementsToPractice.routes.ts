import { Routes } from '@angular/router';
import { RoutesApp } from '../../../../constants';

export const elementsToPracticeRoutes: Routes = [
  {
    path: RoutesApp.root,
    loadComponent: () =>
      import('./elements-to-practice-content').then(
        (m) => m.ElementsToPracticeContentComponent
      ),
  },
  {
    path: RoutesApp.addElementToPractice,
    loadComponent: () =>
      import('./add-element-to-practice').then(
        (m) => m.AddElementToPracticeComponent
      ),
  },
  {
    path: `${RoutesApp.addElementToPractice}/:id`,
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
