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
    // {
    //     path: `${RoutesApp.addWord}/:id`,
    //     loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
    // },
    // {
    //     // path: RoutesApp.testWords,
    //     path: RoutesApp.test,
    //     // loadComponent: () => import('./test-words/test-words.component').then(m => m.TestWordsComponent),
    //     loadComponent: () => import('../test/test.component').then(m => m.TestComponent),
    // },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
