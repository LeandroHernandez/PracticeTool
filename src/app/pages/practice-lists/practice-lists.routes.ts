import { Routes } from '@angular/router';
import { RoutesApp } from '../../constants';

export const practiceListsRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./practice-lists.component').then(m => m.PracticeListsComponent),
    },
    {
        path: RoutesApp.addPracticeList,
        loadComponent: () => import('./add-practice-list/add-practice-list.component').then(m => m.AddPracticeListComponent),
    },
    {
        path: `${RoutesApp.addPracticeList}/:id`,
        loadComponent: () => import('./add-practice-list/add-practice-list.component').then(m => m.AddPracticeListComponent),
    },
    {
        // path: RoutesApp.testWords,
        path: RoutesApp.test,
        // loadComponent: () => import('./test-words/test-words.component').then(m => m.TestWordsComponent),
        loadComponent: () =>
            import('../test').then((m) => m.TestComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
