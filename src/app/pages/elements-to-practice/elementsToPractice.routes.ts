import { Routes } from '@angular/router';
import { RoutesApp } from '../../constants';
import { testGuard } from '../../guards/test-guard.guard';

export const elementsToPracticeRoutes: Routes = [
  {
    path: RoutesApp.root,
    loadComponent: () =>
      import('./elements-to-practice.component').then(
        (m) => m.ElementsToPracticeComponent
      ),
  },
  // {
  //     path: RoutesApp.addElementToPractice,
  //     // loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
  //     loadComponent: () => import('./add-element-to-practice').then(m => m.AddElementToPracticeComponent),
  // },
  // {
  //     path: `${RoutesApp.addElementToPractice}/:id`,
  //     // loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
  //     loadComponent: () => import('./add-element-to-practice').then(m => m.AddElementToPracticeComponent),
  // },
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
    // path: RoutesApp.testWords,
    path: RoutesApp.test,
    // loadComponent: () => import('./test-words/test-words.component').then(m => m.TestWordsComponent),
    loadComponent: () =>
      import('../test/test.component').then((m) => m.TestComponent),
    // canActivate: [testGuard],
  },
  {
    path: RoutesApp.other,
    redirectTo: RoutesApp.root,
  },
];
